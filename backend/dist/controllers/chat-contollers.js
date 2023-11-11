import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import { OpenAIApi } from "openai";
export const generateChatCompletion = async (req, res, next) => {
    const { message } = req.body;
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res
                .status(401)
                .json({ message: "User not registered OR Token malfunction" });
        }
        //grab chats of user
        const chats = user.chats.map(({ role, content }) => ({
            role,
            content,
        }));
        chats.push({ content: message, role: "user" });
        user.chats.push({ content: message, role: "user" });
        //send all chats with new one to openAI API
        const config = configureOpenAI();
        const openai = new OpenAIApi(config);
        const chatResponse = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: chats,
        });
        //get latest response
        user.chats.push(chatResponse.data.choices[0].message);
        await user.save();
        return res.status(200).json({ chats: user.chats });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
export const sendChatsToUser = async (req, res, next) => {
    //user token check
    try {
        const existingUser = await User.findById(res.locals.jwtData.id);
        if (!existingUser)
            return res.status(401).send("User not registered OR Token malfunctioned");
        if (existingUser._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        return res.status(201).json({
            message: "OK",
            chats: existingUser.chats,
        });
    }
    catch (err) {
        console.log(err);
        return res.status(404).json({ message: "ERROR", cause: err.message });
    }
};
export const deleteChats = async (req, res, next) => {
    //user token check
    try {
        console.log("here");
        const existingUser = await User.findById(res.locals.jwtData.id);
        if (!existingUser)
            return res.status(401).send("User not registered OR Token malfunctioned");
        if (existingUser._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        //@ts-ignore
        existingUser.chats = [];
        await existingUser.save();
        return res.status(201).json({
            message: "OK",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(404).json({ message: "ERROR", cause: err.message });
    }
};
//# sourceMappingURL=chat-contollers.js.map