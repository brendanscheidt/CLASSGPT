import chatQueue from "./JobQueue.js";
import User from "../models/User.js"; // Import your User model
import { openai } from "../controllers/chat-contollers.js"; // Import your OpenAI setup

chatQueue.process(async (job, done) => {
  try {
    const { message, className, pageName, userId } = job.data;

    // Fetch the user and perform the necessary logic
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not registered OR Token malfunction");
    }

    let classForChat = user.classes.find(
      (userClass) => userClass.name === className
    );
    if (!classForChat) {
      throw new Error("Class not found");
    }

    let pageForChat = classForChat.pages.find(
      (classPage) => classPage.name === pageName
    );
    if (!pageForChat) {
      throw new Error("Page Not Found.");
    }

    // Add user's message to chat
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
      throw new Error("Error: No message content found");
    }

    // After completing the task
    await user.save();
    done(null, { chats: pageForChat.chats }); // Return the result
  } catch (error) {
    console.error(error);
    done(error); // Pass the error if something goes wrong
  }
});
