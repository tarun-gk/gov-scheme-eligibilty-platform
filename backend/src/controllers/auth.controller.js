import {
    authenticateAccount,
    createAccount,
    getAccountById,
    issueAuthTokens,
    revokeRefreshToken,
    rotateRefreshToken,
} from "../services/auth.service.js";

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
};

function setRefreshCookie(res, refreshToken, expiresAt) {
    res.cookie("refreshToken", refreshToken, {
        ...REFRESH_COOKIE_OPTIONS,
        expires: expiresAt,
    });
}

function clearRefreshCookie(res) {
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
}

function getRefreshTokenFromRequest(req) {
    if (req.body?.refreshToken) {
        return req.body.refreshToken;
    }

    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/(?:^|; )refreshToken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export async function signupController(req, res) {
    try {
        const { email, password, name } = req.body || {};

        if (!email || !password || !name) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const account = await createAccount({
            email,
            password,
            name: String(name).trim(),
        });

        const tokens = await issueAuthTokens({
            account,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"] || null,
        });

        setRefreshCookie(res, tokens.refreshToken, new Date(tokens.expiresAt));

        return res.status(201).json({
            user: account,
            token: tokens.accessToken,
            accessToken: tokens.accessToken,
        });
    } catch (error) {
        const statusCode = error.message.includes("already exists") ? 409 : 500;
        return res.status(statusCode).json({ message: statusCode === 409 ? error.message : "Failed to create account" });
    }
}

export async function loginController(req, res) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const account = await authenticateAccount({ email, password, ipAddress: req.ip });
        const tokens = await issueAuthTokens({
            account,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"] || null,
        });

        setRefreshCookie(res, tokens.refreshToken, new Date(tokens.expiresAt));

        return res.status(200).json({
            user: account,
            token: tokens.accessToken,
            accessToken: tokens.accessToken,
        });
    } catch (error) {
        if (error?.retryAfterSeconds) {
            res.setHeader("Retry-After", String(error.retryAfterSeconds));
            return res.status(429).json({ message: error.message });
        }

        return res.status(401).json({ message: "Invalid email or password" });
    }
}

export async function refreshController(req, res) {
    try {
        const refreshToken = getRefreshTokenFromRequest(req);

        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }

        const tokens = await rotateRefreshToken(refreshToken, {
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"] || null,
        });

        return res.status(200).json({
            accessToken: tokens.accessToken,
        });
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
}

export async function logoutController(req, res) {
    try {
        const refreshToken = getRefreshTokenFromRequest(req);

        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }

        await revokeRefreshToken(refreshToken);
        clearRefreshCookie(res);
        return res.status(200).json({ message: "Session terminated" });
    } catch (error) {
        return res.status(500).json({ message: "Failed to terminate session" });
    }
}

export async function getMeController(req, res) {
    try {
        const account = await getAccountById(req.user.id);

        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        return res.status(200).json({ user: account });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch account info" });
    }
}
