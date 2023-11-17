import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import { OpenAIApi, ChatCompletionRequestMessage } from "openai";

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message, className, pageName } = req.body;
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

    let pageForChat = classForChat.pages.find(
      (classPage) => classPage.name === pageName
    );

    if (!pageForChat) {
      return res.status(404).json({ message: "Page Not Found." });
    }

    //grab chats of user
    const chats = pageForChat.chats.map(({ role, content }) => ({
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
    pageForChat.chats.push({ content: message, role: "user" });
    pageForChat.chats.push(chatResponse.data.choices[0].message);

    await user.save();

    return res.status(200).json({ chats: pageForChat.chats });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const createClassPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { className, pageName } = req.body;
    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunction" });
    }

    const classForChat = user.classes.find(
      (userClass) => userClass.name === className
    );

    if (!classForChat) {
      return res.status(404).json({ message: "Class not found" });
    }

    classForChat.pages.push({ name: pageName });

    await user.save();

    return res.status(201).json({ message: "OK", pages: classForChat.pages });
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
    const pageForChat = req.params.pagename;

    if (!existingUser)
      return res.status(401).send("User not registered OR Token malfunctioned");

    if (existingUser._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    let userClassPages = [];

    existingUser.classes.forEach((userClass) => {
      if (userClass.name === classForChat) {
        userClassPages = userClass.pages;
      }
    });

    let userPageChats = [];

    userClassPages.forEach((page) => {
      if (page.name === pageForChat) {
        userPageChats = page.chats;
      }
    });

    return res.status(201).json({
      message: "OK",
      chats: userPageChats,
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
    const { name, model } = req.body;

    const existingUser = await User.findById(res.locals.jwtData.id);

    existingUser.classes.push({ name, model });
    console.log(existingUser.classes);

    await existingUser.save();
    console.log("hit");

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
    const pagename = req.params.pagename;
    const existingUser = await User.findById(res.locals.jwtData.id);

    if (!existingUser)
      return res.status(401).send("User not registered OR Token malfunctioned");

    if (existingUser._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    let classForChat = existingUser.classes.find(
      (userClass) => userClass.name === className
    );

    let pageWithChat = classForChat.pages.find((page) => {
      if (page.name === pagename) classForChat.pages.remove(page);
    });

    //@ts-ignore
    //pageWithChat.chats = [];

    await existingUser.save();
    return res.status(201).json({
      message: "OK",
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "ERROR", cause: err.message });
  }
};
