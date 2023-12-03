import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { OpenAI } from "openai";
import { config } from "dotenv";
import { MODEL_TYPE } from "../utils/constants.js";
import chatQueue from "../worker/JobQueue.js";

config();

export const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_SECRET,
});

/* export const generateChatCompletion = async (
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

    pageForChat.chats.push({ content: message, role: "user" });

    const assistant = classForChat.model;
    const thread = pageForChat.thread;

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    let parts = assistant.instructions.split(".");
    if (parts.length > 1) {
      parts[1] =
        "Always reply in markdown format and make use of headings, lists, italics, etc. Also always use emojis for every response. Classes and topics wont always be about mathematics, but if they are, always use Latex format for math expressions. In your responses, use `$...$` for inline math expressions and `$$...$$` for block math expressions. Replace all instances of `( ... )` with `$ ... $` and `[ ... ]` with `$$ ... $$`." +
        `The topic the user wants to talk about is ${pageName}. The instructions the user specifically has for this topic are: """${pageForChat.pageInstructions}""". In addition, they have overall instructions for you as an assistant.` +
        parts[1];
    }

    const completeInstructions = parts.join(".");

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
      instructions: completeInstructions,
    });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    //polling mechanism to see if runStatus is completed
    //** make more robust (check more than completed)**
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Get the last assistant message from the messages array
    const messages = await openai.beta.threads.messages.list(thread.id);

    let lastMessageContent = "";
    messages.data.forEach((message) => {
      if (message.run_id === run.id && message.role === "assistant") {
        message.content.forEach((contentItem) => {
          if (contentItem.type === "text") {
            lastMessageContent += contentItem.text.value;
          }
        });
      }
    });

    // If assistant message content found, add it to the chats
    if (lastMessageContent) {
      pageForChat.chats.push({
        content: lastMessageContent,
        role: "assistant",
      });
    } else {
      return res.status(500).json({ error: "Error: No message content found" });
    }

    await user.save();

    return res.status(200).json({ chats: pageForChat.chats });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}; */

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const job = await chatQueue.add({
    message: req.body.message,
    className: req.body.className,
    pageName: req.body.pageName,
    userId: res.locals.jwtData.id,
  });

  console.log(job.id);

  res.json({ jobId: job.id });
};

export const checkJobStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const jobId = req.params.jobid;
  const job = await chatQueue.getJob(jobId);

  console.log(job);

  if (job === null) {
    return res.status(404).json({ message: "Job not found" });
  }

  const state = await job.getState();
  const progress = await job.progress();
  const result = job.returnvalue;
  const error = job.failedReason;

  res.status(200).json({ id: job.id, state, progress, result, error });
};

export const createClassPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { className, pageName, pageInstructions } = req.body;
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

    let pageAlreadyExists = false;

    classForChat.pages.find((classPage) => {
      if (classPage.name === pageName) pageAlreadyExists = true;
    });

    if (pageAlreadyExists) {
      return res.status(500).json({ message: "Cant Have duplicate page name" });
    }

    const thread = await openai.beta.threads.create();

    classForChat.pages.push({ name: pageName, pageInstructions, thread });

    await user.save();

    return res.status(201).json({ message: "OK", pages: classForChat.pages });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editClassPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { className, oldName, newName, pageInstructions } = req.body;
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

    let pageAlreadyExists = false;

    classForChat.pages.find((classPage) => {
      if (
        classPage.name === newName &&
        classPage.pageInstructions === pageInstructions
      )
        pageAlreadyExists = true;
    });

    if (pageAlreadyExists) {
      return res.status(500).json({ message: "Cant Have duplicate page name" });
    }

    let pageForChat = classForChat.pages.find(
      (classPage) => classPage.name === oldName
    );

    if (!pageForChat) {
      return res.status(404).json({ message: "Page Not Found." });
    }

    pageForChat.name = newName;
    pageForChat.pageInstructions = pageInstructions;

    await user.save();

    return res.status(201).json({ message: "OK", pageForChat });
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

    return res.status(200).json({
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

    return res.status(200).json({
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

    if (!existingUser)
      return res.status(401).send("User not registered OR Token malfunctioned");

    if (existingUser._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    const assistant = await openai.beta.assistants.create({
      name: `${name} Class Tutor`,
      instructions:
        "Always reply in markdown format and make use of headings, lists, italics, etc. Also always use emojis for every response. Classes and topics wont always be about mathematics, but if they are, always use Latex format for math expressions. In your responses, use `$...$` for inline math expressions and `$$...$$` for block math expressions. Replace all instances of `( ... )` with `$ ... $` and `[ ... ]` with `$$ ... $$`." +
        `You are a personal tutor for ${name} class. Follow the instructions the user gives you for the topic and overall as an assistant, here are the users instructions for you as an assistant: """${model.instructions}"""`,
      tools: [{ type: "code_interpreter" }],
      model: MODEL_TYPE,
    });

    existingUser.classes.push({ name, model: assistant });

    await existingUser.save();

    return res.status(201).json({
      message: "OK",
      classes: existingUser.classes,
    });
  } catch (err) {
    return res.status(404).send("Error");
  }
};

export const editUserClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldClassName, newClassName, modelInstructions } = req.body;

    const user = await User.findById(res.locals.jwtData.id);

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunction" });
    }

    let classAlreadyExists = false;

    user.classes.find((userClass) => {
      if (userClass.name === newClassName) {
        const regex = /"""(.*?)"""/s;

        const match = userClass.model.instructions.match(regex);
        const extractedText = match ? match[1] : "";
        if (extractedText === modelInstructions) {
          classAlreadyExists = true;
        }
      }
    });

    console.log(classAlreadyExists);

    if (classAlreadyExists) return res.status(500).json({ message: "Error" });

    const classForChat = user.classes.find(
      (userClass) => userClass.name === oldClassName
    );

    if (!classForChat) {
      return res.status(404).json({ message: "Class not found" });
    }

    classForChat.name = newClassName;
    classForChat.model.instructions =
      "Always reply in markdown format and make use of headings, lists, italics, etc. Also always use emojis for every response. Classes and topics wont always be about mathematics, but if they are, always use Latex format for math expressions. In your responses, use `$...$` for inline math expressions and `$$...$$` for block math expressions. Replace all instances of `( ... )` with `$ ... $` and `[ ... ]` with `$$ ... $$`." +
      `You are a personal tutor for ${newClassName} class. Follow the instructions the user gives you for the topic and overall as an assistant, here are the users instructions for you as an assistant: """${modelInstructions}"""`;

    await user.save();

    return res.status(201).json({ message: "OK", classForChat });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "ERROR", cause: err.message });
  }
};

export const deleteClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    if (!classForChat) {
      return res.status(404).json({ message: "Class not found" });
    }

    const response = await openai.beta.assistants.del(classForChat.model.id);

    existingUser.classes.pull({ name: className });
    await existingUser.save();

    return res.status(200).json({ message: "OK", existingUser });
  } catch (err) {
    return res.status(500).json({ message: "An error occured" });
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

    if (!classForChat) {
      return res.status(404).send("Class not found");
    }

    const page = classForChat.pages.find((page) => page.name === pagename);

    if (page) {
      // Clear the chats array while maintaining the Mongoose DocumentArray type
      page.chats.splice(0, page.chats.length);
      page.thread = await openai.beta.threads.create();
    } else {
      return res.status(404).send("Page not found");
    }

    await existingUser.save();
    return res.status(201).json({
      message: "OK",
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "ERROR", cause: err.message });
  }
};

export const deletePage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const className = req.params.classname;
    const pageName = req.params.pagename;
    const existingUser = await User.findById(res.locals.jwtData.id);

    if (!existingUser)
      return res.status(401).send("User not registered OR Token malfunctioned");

    if (existingUser._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    let classForChat = existingUser.classes.find(
      (userClass) => userClass.name === className
    );

    if (!classForChat) {
      return res.status(404).send("Class not found");
    }

    const pageIndex = classForChat.pages.findIndex(
      (page) => page.name === pageName
    );

    if (pageIndex === -1) {
      return res.status(404).send("Page not found");
    }

    // Remove the page from the class
    classForChat.pages.splice(pageIndex, 1);

    await existingUser.save();
    return res.status(200).json({
      message: "Page deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "ERROR", cause: err.message });
  }
};
