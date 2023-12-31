import express from "express";
import { config } from "dotenv";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../../frontend/dist");
config();
const app = express();
// Middleware //
app.use(cors({
    origin: "https://class-gpt-70992c3b881c.herokuapp.com",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use("/api/v1", appRouter);
// Serve static files from frontend build directory
app.use(express.static(frontendPath));
// Serve index.html on all other routes
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});
export default app;
//# sourceMappingURL=app.js.map