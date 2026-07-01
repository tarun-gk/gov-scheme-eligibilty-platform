export function requireAdmin(req, res, next) {
  const configuredAdminKey = process.env.ADMIN_KEY;

  if (!configuredAdminKey || String(configuredAdminKey).trim() === "") {
    return res.status(503).json({
      message: "Admin access is disabled. Configure ADMIN_KEY in backend/.env",
    });
  }

  const providedAdminKey = req.headers["x-admin-key"];
  if (providedAdminKey !== configuredAdminKey) {
    return res.status(401).json({ message: "Unauthorized admin request" });
  }

  return next();
}
