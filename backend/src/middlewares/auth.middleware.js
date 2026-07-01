import { verifyToken } from "../services/auth.service.js";

export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token);
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

export function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];

        try {
            const decoded = verifyToken(token);
            if (decoded.role === "admin") {
                req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
                return next();
            }
            return res.status(403).json({ message: "Admin access required" });
        } catch {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    }

    return res.status(401).json({ message: "Authentication required" });
}
