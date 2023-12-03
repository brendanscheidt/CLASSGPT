import Queue from "bull";
import dotenv from "dotenv";
dotenv.config();
const port = parseInt(process.env.REDIS_PORT, 10);
if (isNaN(port)) {
    throw new Error("Invalid Redis port number");
}
const redisUrl = `redis://default:${process.env.REDIS_PASS}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
const chatQueue = new Queue("chatQueue", redisUrl);
export default chatQueue;
//# sourceMappingURL=JobQueue.js.map