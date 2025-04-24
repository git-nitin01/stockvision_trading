import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redis.on("error", (err) => console.error("Redis Client Error:", err));

export const connectRedis = async () => {
  await redis.connect();
  console.log("Connected to Redis");
};

export default redis;
