import { Router } from "express";
import { verifyToken } from "../utils/token-manager.js";
import { chatCompletionValidator, validate } from "../utils/validators.js";
import { createClassPage, createUserClass, deleteChats, deleteClass, editClassPage, editUserClass, generateChatCompletion, sendChatsToUser, sendClassesToUser, } from "../controllers/chat-contollers.js";
// protected API
const chatRoutes = Router();
chatRoutes.post("/new", validate(chatCompletionValidator), verifyToken, generateChatCompletion);
chatRoutes.get("/classes", verifyToken, sendClassesToUser);
chatRoutes.post("/createClass", verifyToken, createUserClass);
chatRoutes.patch("/editClass", verifyToken, editUserClass);
chatRoutes.post("/createPage", verifyToken, createClassPage);
chatRoutes.patch("/editPage", verifyToken, editClassPage);
chatRoutes.get("/:classname/:pagename", verifyToken, sendChatsToUser);
chatRoutes.delete("/delete/:classname/:pagename", verifyToken, deleteChats);
chatRoutes.delete("/deleteClass/:classname", verifyToken, deleteClass);
export default chatRoutes;
//# sourceMappingURL=chat-routes.js.map