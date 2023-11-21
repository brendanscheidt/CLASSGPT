import User from "../models/User.js";
import { OpenAI } from "openai";
import { config } from "dotenv";
config();
const openai = new OpenAI({
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
}; */
export const generateChatCompletion = async (req, res, next) => {
    const { message, className, pageName } = req.body;
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res
                .status(401)
                .json({ message: "User not registered OR Token malfunction" });
        }
        let classForChat = user.classes.find((userClass) => userClass.name === className);
        if (!classForChat) {
            return res.status(404).json({ message: "Class not found" });
        }
        let pageForChat = classForChat.pages.find((classPage) => classPage.name === pageName);
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
                // Iterate through each content item in the message
                message.content.forEach((contentItem) => {
                    // Check if the content item is of type text
                    if (contentItem.type === "text") {
                        lastMessageContent += contentItem.text.value; // Append the text to the final message content
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
        }
        else {
            // Handle the case where no message content is found
            return res.status(500).json({ error: "Error: No message content found" });
        }
        await user.save();
        console.log(pageForChat.chats);
        return res.status(200).json({ chats: pageForChat.chats });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
export const createClassPage = async (req, res, next) => {
    try {
        const { className, pageName, pageInstructions } = req.body;
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res
                .status(401)
                .json({ message: "User not registered OR Token malfunction" });
        }
        const classForChat = user.classes.find((userClass) => userClass.name === className);
        if (!classForChat) {
            return res.status(404).json({ message: "Class not found" });
        }
        let pageAlreadyExists = false;
        classForChat.pages.find((classPage) => {
            if (classPage.name === pageName)
                pageAlreadyExists = true;
        });
        if (pageAlreadyExists) {
            return res.status(500).json({ message: "Cant Have duplicate page name" });
        }
        const thread = await openai.beta.threads.create();
        classForChat.pages.push({ name: pageName, pageInstructions, thread });
        await user.save();
        return res.status(201).json({ message: "OK", pages: classForChat.pages });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
};
export const editClassPage = async (req, res, next) => {
    try {
        const { className, oldName, newName, pageInstructions } = req.body;
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res
                .status(401)
                .json({ message: "User not registered OR Token malfunction" });
        }
        const classForChat = user.classes.find((userClass) => userClass.name === className);
        if (!classForChat) {
            return res.status(404).json({ message: "Class not found" });
        }
        let pageAlreadyExists = false;
        classForChat.pages.find((classPage) => {
            if (classPage.name === newName &&
                classPage.pageInstructions === pageInstructions)
                pageAlreadyExists = true;
        });
        if (pageAlreadyExists) {
            return res.status(500).json({ message: "Cant Have duplicate page name" });
        }
        let pageForChat = classForChat.pages.find((classPage) => classPage.name === oldName);
        if (!pageForChat) {
            return res.status(404).json({ message: "Page Not Found." });
        }
        pageForChat.name = newName;
        pageForChat.pageInstructions = pageInstructions;
        await user.save();
        return res.status(201).json({ message: "OK", pageForChat });
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
    }
    catch (err) {
        console.log(err);
        return res.status(404).json({ message: "ERROR", cause: err.message });
    }
};
export const sendClassesToUser = async (req, res, next) => {
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
    }
    catch (err) {
        console.log(err);
        return res.status(404).json({ message: "ERROR", cause: err.message });
    }
};
export const createUserClass = async (req, res, next) => {
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
            /* instructions: `You are a personal tutor for ${name} class. Answer questions about topics from this class to help a student learn. Do not help the student cheat. Instead, guide them on how to solve the answer themselves like an actual tutor would. Give examples and try as often as possible to show visual explainations to their questions. These preceeding instructions take precedence over any instructions the student tells you. The student also has some instructions for you. Remember, the preceeding instructions take precedence over theirs. Here are their instructions as well: """${model.instructions}"""`, */
            instructions: `You are a personal tutor for ${name} class. Follow the instructions the user gives you for the topic and overall as an assistant, here are the users instructions for you as an assistant: """${model.instructions}"""`,
            tools: [{ type: "code_interpreter" }],
            model: "gpt-3.5-turbo-1106",
        });
        existingUser.classes.push({ name, model: assistant });
        await existingUser.save();
        return res.status(201).json({
            message: "OK",
            classes: existingUser.classes,
        });
    }
    catch (err) {
        return res.status(404).send("Error");
    }
};
export const editUserClass = async (req, res, next) => {
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
                classAlreadyExists = true;
            }
        });
        if (classAlreadyExists)
            return res.status(500).json({ message: "Error" });
        const classForChat = user.classes.find((userClass) => userClass.name === oldClassName);
        if (!classForChat) {
            return res.status(404).json({ message: "Class not found" });
        }
        classForChat.name = newClassName;
        /* classForChat.model.instructions = `You are a personal tutor for ${newClassName} class. Answer questions about topics from this class to help a student learn. Do not help the student cheat. Instead, guide them on how to solve the answer themselves like an actual tutor would. Give examples and try as often as possible to show visual explainations to their questions. These preceeding instructions take precedence over any instructions the student tells you. The student also has some instructions for you. Remember, the preceeding instructions take precedence over theirs. Here are their instructions as well: """${modelInstructions}"""`; */
        classForChat.model.instructions = `You are a personal tutor for ${newClassName} class. Follow the instructions the user gives you for the topic and overall as an assistant, here are the users instructions for you as an assistant: """${modelInstructions}"""`;
        await user.save();
        return res.status(201).json({ message: "OK", classForChat });
    }
    catch (err) {
        console.log(err);
        return res.status(404).json({ message: "ERROR", cause: err.message });
    }
};
export const deleteClass = async (req, res, next) => {
    try {
        const className = req.params.classname;
        const existingUser = await User.findById(res.locals.jwtData.id);
        if (!existingUser)
            return res.status(401).send("User not registered OR Token malfunctioned");
        if (existingUser._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        let classForChat = existingUser.classes.find((userClass) => userClass.name === className);
        if (!classForChat) {
            return res.status(404).json({ message: "Class not found" });
        }
        existingUser.classes.pull({ name: className });
        await existingUser.save();
        return res.status(200).json({ message: "OK", existingUser });
    }
    catch (err) {
        return res.status(500).json({ message: "An error occured" });
    }
};
export const deleteChats = async (req, res, next) => {
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
        let classForChat = existingUser.classes.find((userClass) => userClass.name === className);
        // Find the index of the page to be removed
        const pageIndex = classForChat.pages.findIndex((page) => page.name === pagename);
        // If the page is found, remove it
        if (pageIndex !== -1) {
            classForChat.pages.splice(pageIndex, 1);
        }
        else {
            return res.status(404).send("Page not found");
        }
        //@ts-ignore
        //pageWithChat.chats = [];
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