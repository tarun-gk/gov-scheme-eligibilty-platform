import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { env } from "../config/env.js";
import {
    createSession,
    getActiveSessionByToken,
    revokeSessionByToken,
} from "./core/session.service.js";
import {
    clearFailedLogins,
    getLoginLock,
    recordFailedLogin,
} from "./core/login-attempt.service.js";

const SALT_ROUNDS = 10;

export async function createAccount({ email, password, name }) {
    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if email already exists
    const [existing] = await db.query(
        "SELECT id FROM accounts WHERE email = ?",
        [normalizedEmail]
    );

    if (existing.length > 0) {
        throw new Error("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await db.query(
        `INSERT INTO accounts (email, password, name, role) VALUES (?, ?, ?, 'user')`,
        [normalizedEmail, hashedPassword, String(name).trim()]
    );

    const accountId = result.insertId;

    return {
        id: accountId,
        email: normalizedEmail,
        name: String(name).trim(),
        role: "user",
    };
}

export async function authenticateAccount({ email, password, ipAddress = null }) {
    const normalizedEmail = String(email).trim().toLowerCase();

    const lock = await getLoginLock({ email: normalizedEmail, ipAddress });
    if (lock) {
        const retryAfterSeconds = Math.max(1, Math.ceil((lock.lockUntil - Date.now()) / 1000));
        const error = new Error("Too many failed login attempts. Try again later.");
        error.retryAfterSeconds = retryAfterSeconds;
        throw error;
    }

    const [rows] = await db.query(
        "SELECT id, email, password, name, role FROM accounts WHERE email = ?",
        [normalizedEmail]
    );

    if (rows.length === 0) {
        await recordFailedLogin({ email: normalizedEmail, ipAddress });
        throw new Error("Invalid email or password");
    }

    const account = rows[0];
    const passwordMatch = await bcrypt.compare(password, account.password);

    if (!passwordMatch) {
        await recordFailedLogin({ email: normalizedEmail, ipAddress });
        throw new Error("Invalid email or password");
    }

    await clearFailedLogins({ email: normalizedEmail, ipAddress });

    return {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
    };
}

export function generateAccessToken(account) {
    return jwt.sign(
        { id: account.id, email: account.email, role: account.role },
        env.JWT_ACCESS_SECRET,
        { expiresIn: env.JWT_ACCESS_TTL }
    );
}

export function generateRefreshToken(account) {
    return jwt.sign(
        { id: account.id, type: "refresh" },
        env.JWT_REFRESH_SECRET,
        { expiresIn: `${env.JWT_REFRESH_TTL_DAYS}d` }
    );
}

export async function issueAuthTokens({ account, ipAddress, userAgent }) {
    const accessToken = generateAccessToken(account);
    const refreshToken = generateRefreshToken(account);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_TTL_DAYS);

    await createSession({
        accountId: account.id,
        refreshToken,
        expiresAt,
        ipAddress,
        userAgent,
    });

    return {
        accessToken,
        refreshToken,
        expiresAt: expiresAt.toISOString(),
    };
}

export async function rotateRefreshToken(refreshToken, context = {}) {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    if (payload?.type !== "refresh") {
        throw new Error("Invalid refresh token type");
    }

    const activeSession = await getActiveSessionByToken(refreshToken);
    if (!activeSession) {
        throw new Error("Session expired or revoked");
    }

    await revokeSessionByToken(refreshToken);
    const account = await getAccountById(payload.id);
    if (!account) {
        throw new Error("Account not found");
    }

    return issueAuthTokens({
        account,
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null,
    });
}

export async function revokeRefreshToken(refreshToken) {
    await revokeSessionByToken(refreshToken);
}

export function verifyToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

export async function getAccountById(accountId) {
    const [rows] = await db.query(
        "SELECT id, email, name, role, created_at FROM accounts WHERE id = ?",
        [accountId]
    );

    return rows[0] || null;
}
