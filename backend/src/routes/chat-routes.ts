import { Router } from "express";
import { verifyToken } from "../utils/token-manager.js";
import { chatCompletionValidator, validate } from "../utils/validators.js";
import {
  createClassPage,
  createUserClass,
  deleteChats,
  editClassPage,
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

chatRoutes.get("/classes", verifyToken, sendClassesToUser);
chatRoutes.post("/createClass", verifyToken, createUserClass);
chatRoutes.post("/createPage", verifyToken, createClassPage);
chatRoutes.patch("/editPage", verifyToken, editClassPage);
chatRoutes.get("/:classname/:pagename", verifyToken, sendChatsToUser);
chatRoutes.delete("/delete/:classname/:pagename", verifyToken, deleteChats);

export default chatRoutes;
