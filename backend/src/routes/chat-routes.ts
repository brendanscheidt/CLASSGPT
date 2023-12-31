import { Router } from "express";
import { verifyToken } from "../utils/token-manager.js";
import { chatCompletionValidator, validate } from "../utils/validators.js";
import {
  checkJobStatus,
  createClassPage,
  createUserClass,
  deleteChats,
  deleteClass,
  deleteJob,
  deletePage,
  editClassPage,
  editUserClass,
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
chatRoutes.get("/jobstatus/:jobid", verifyToken, checkJobStatus);
chatRoutes.delete("/deleteJob/:jobid", verifyToken, deleteJob);
chatRoutes.post("/createClass", verifyToken, createUserClass);
chatRoutes.patch("/editClass", verifyToken, editUserClass);
chatRoutes.post("/createPage", verifyToken, createClassPage);
chatRoutes.patch("/editPage", verifyToken, editClassPage);
chatRoutes.get("/:classname/:pagename", verifyToken, sendChatsToUser);
chatRoutes.delete("/delete/:classname/:pagename", verifyToken, deleteChats);
chatRoutes.delete("/deleteClass/:classname", verifyToken, deleteClass);
chatRoutes.delete("/deletePage/:classname/:pagename", verifyToken, deletePage);

export default chatRoutes;
