import { Router } from "express";
import { verifyToken } from "../utils/token-manager.js";
import { chatCompletionValidator, validate } from "../utils/validators.js";
import {
  createUserClass,
  deleteChats,
  generateChatCompletion,
  sendChatsToUser,
  sendClassesToUser,
} from "../controllers/chat-contollers.js";

// protected API
const chatRoutes = Router();

chatRoutes.post(
  "/new",
  validate(chatCompletionValidator),
  verifyToken,
  generateChatCompletion
);

chatRoutes.delete("/delete/:classname", verifyToken, deleteChats);
chatRoutes.get("/classes", verifyToken, sendClassesToUser);
chatRoutes.post("/createClass", verifyToken, createUserClass);
chatRoutes.get("/:classname", verifyToken, sendChatsToUser);

export default chatRoutes;
