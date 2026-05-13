import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3000;


app.use(helmet());
app.use(cors({
  origin: [
    "https://*.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// API routes
app.use("/api/v1", routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 CMS Backend on port ${PORT}`));
}

export default app;
