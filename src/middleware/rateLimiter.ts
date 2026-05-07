import rateLimit from "express-rate-limit";

export const adminRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { code: 429, message: "Too many requests. Please slow down and retry after 60 seconds.", retry_after: 60 },
  standardHeaders: true,
  legacyHeaders: false,
});

export const serviceRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 600,
  message: { code: 429, message: "Too many requests. Please slow down and retry after 60 seconds.", retry_after: 60 },
  standardHeaders: true,
  legacyHeaders: false,
});

export const studentRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { code: 429, message: "Too many requests. Please slow down and retry after 60 seconds.", retry_after: 60 },
  standardHeaders: true,
  legacyHeaders: false,
});
