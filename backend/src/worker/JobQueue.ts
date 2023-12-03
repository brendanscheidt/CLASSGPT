import Queue from "bull";

const redisConfig = {
  host: process.env.REDIS_HOST, // Replace with your Redis host
  port: parseInt(process.env.REDIS_PORT, 10), // Replace with your Redis port
  password: process.env.REDIS_PASS, // If your Redis server requires authentication
};

const chatQueue = new Queue("chatQueue", { redis: redisConfig });

export default chatQueue;
