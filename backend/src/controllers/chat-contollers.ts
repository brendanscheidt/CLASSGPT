import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import { OpenAIApi, ChatCompletionRequestMessage } from "openai";

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message, className } = req.body;
  try {
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunction" });
    }

    let classForChat = user.classes.find(
      (userClass) => userClass.name === className
    );

    if (!classForChat) {
      return res.status(404).json({ message: "Class not found" });
    }

    //grab chats of user
    const chats = classForChat.chats.map(({ role, content }) => ({
      role,
      content,
    })) as ChatCompletionRequestMessage[];

    chats.push({ content: message, role: "user" });

    //send all chats with new one to openAI API
    const config = configureOpenAI();
    const openai = new OpenAIApi(config);

    const chatResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: chats,
    });

    //get latest response
    classForChat.chats.push({ content: message, role: "user" });
    classForChat.chats.push(chatResponse.data.choices[0].message);

    await user.save();

    return res.status(200).json({ chats: classForChat.chats });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //user token check
  try {
    const existingUser = await User.findById(res.locals.jwtData.id);
    const classForChat = req.params.classname;

    if (!existingUser)
      return res.status(401).send("User not registered OR Token malfunctioned");

    if (existingUser._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    let userClassChats = [];

    existingUser.classes.forEach((userClass) => {
      if (userClass.name === classForChat) {
        userClassChats = userClass.chats;
      }
    });

    return res.status(201).json({
      message: "OK",
      chats: userClassChats,
    });
  } catch (err) {
    console.log(err);

    return res.status(404).json({ message: "ERROR", cause: err.message });
  }
};

export const sendClassesToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      classes: existingUser.classes,
    });
  } catch (err) {
    console.log(err);

    return res.status(404).json({ message: "ERROR", cause: err.message });
  }
};

export const createUserClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    const existingUser = await User.findById(res.locals.jwtData.id);

    existingUser.classes.push({ name: name });

    await existingUser.save();

    return res.status(201).json({
      message: "OK",
      classes: existingUser.classes,
    });
  } catch (err) {
    return res.status(404).send("Error");
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //user token check
  try {
    const className = req.params.classname;
    const existingUser = await User.findById(res.locals.jwtData.id);

    if (!existingUser)
      return res.status(401).send("User not registered OR Token malfunctioned");

    if (existingUser._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    let classForChat = existingUser.classes.find(
      (userClass) => userClass.name === className
    );

    //@ts-ignore
    classForChat.chats = [];

    await existingUser.save();
    return res.status(201).json({
      message: "OK",
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "ERROR", cause: err.message });
  }
};
