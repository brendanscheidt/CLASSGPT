import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

config();

const app = express();

// Middleware //
app.use(cors({ origin: true, credentials: true }));

app.use(express.json());

app.use(cookieParser(process.env.COOKIE_SECRET));

// Serve static files from frontend build directory
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// Serve index.html on all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use("/api/v1", appRouter);

export default app;
