import Queue from "bull";
import dotenv from "dotenv";
import { connect } from "mongoose";
dotenv.config();

async function connectToDatabase() {
  try {
    await connect(process.env.MONGODB_URL);
  } catch (err) {
    console.log(err);
    throw new Error("Cannot Connect to MongoDB");
  }
}

connectToDatabase();

const port = parseInt(process.env.REDIS_PORT, 10);
if (isNaN(port)) {
  throw new Error("Invalid Redis port number");
}

const redisUrl = `redis://default:${process.env.REDIS_PASS}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
const chatQueue = new Queue("chatQueue", redisUrl);

export default chatQueue;
