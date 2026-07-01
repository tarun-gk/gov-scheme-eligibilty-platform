import express from "express";
import cors from "cors";
import helmet from "helmet";
import schemesRoutes from "./routes/schemes.routes.js";
import platformRoutes from "./routes/platform.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productionRoutes from "./routes/v1/production.routes.js";
import { requestContext } from "./middlewares/audit.middleware.js";
import { ipRateLimiter } from "./middlewares/rateLimit.middleware.js";
import { env } from "./config/env.js";
import { dispatchPendingNotifications } from "./services/core/notifications.service.js";

const NOTIFICATION_DISPATCH_INTERVAL_MS = 15000;
const ALLOWED_ORIGINS = new Set(
	(env.FRONTEND_ORIGIN || "http://localhost:5173").split(",").map((origin) => origin.trim()).filter(Boolean)
);

const app = express();

app.disable("x-powered-by");

app.use(
	helmet({
		contentSecurityPolicy: {
			useDefaults: true,
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", "data:"],
				connectSrc: ["'self'", "https://api.openai.com"],
				fontSrc: ["'self'", "data:"],
				objectSrc: ["'none'"],
				baseUri: ["'self'"],
				frameAncestors: ["'none'"],
			},
		},
	})
);

const corsOptions = {
	origin(origin, callback) {
		if (!origin || ALLOWED_ORIGINS.has(origin)) {
			return callback(null, true);
		}

		return callback(new Error("CORS policy does not allow this origin"));
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-request-id"],
	maxAge: 86400,
};

app.use(
	cors(corsOptions)
);
app.options("*", cors(corsOptions));
app.use(ipRateLimiter);
app.use(requestContext);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/schemes", schemesRoutes);
app.use("/api/v1", productionRoutes);

app.use("/api", platformRoutes);
app.use("/api/admin", adminRoutes);

setInterval(() => {
	dispatchPendingNotifications({ limit: 100 }).catch((error) => {
		console.error("Notification dispatch cycle failed:", error.message);
	});
}, NOTIFICATION_DISPATCH_INTERVAL_MS);

app.use((error, req, res, next) => {
	if (res.headersSent) {
		return next(error);
	}

	console.error("Unhandled request error:", error?.message || error);
	const message = env.NODE_ENV === "production" ? "Unexpected server error" : (error?.message || "Unexpected server error");
	return res.status(500).json({ message });
});

const PORT = env.PORT;
app.listen(PORT);
