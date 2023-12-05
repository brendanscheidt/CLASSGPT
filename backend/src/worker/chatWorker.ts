/* import chatQueue from "./JobQueue.js";
import User from "../models/User.js"; // Import your User model
import { openai } from "../controllers/chat-contollers.js"; // Import your OpenAI setup
import mongoose from "mongoose";

chatQueue.process(2, async (job, done) => {

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

    if (error instanceof mongoose.Error.VersionError) {

    }

    console.error(error);
    done(error); // Pass the error if something goes wrong
  }
});
 */

import chatQueue from "./JobQueue.js";
import User from "../models/User.js"; // Import your User model
import { openai } from "../controllers/chat-contollers.js"; // Import your OpenAI setup
import mongoose from "mongoose";

const MAX_RETRIES = 3; // Maximum number of retries

chatQueue.process(2, async (job, done) => {
  const startTime = new Date(); // Capture start time
  let elapsedTime = 0;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const { message, className, pageName, userId } = job.data;

      console.log(
        `Entering chat generation...\n\tmessage: ${message}, className: ${className}, pageName: ${pageName}, userId: ${userId}`
      );

      // Fetch the user and perform the necessary logic
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not registered OR Token malfunction");
      }
      console.log(`Found user...\n\t${user}`);

      let classForChat = user.classes.find(
        (userClass) => userClass.name === className
      );
      if (!classForChat) {
        throw new Error("Class not found");
      }
      console.log(`Found class...\n\t${classForChat}`);

      let pageForChat = classForChat.pages.find(
        (classPage) => classPage.name === pageName
      );
      if (!pageForChat) {
        throw new Error("Page Not Found.");
      }
      console.log(
        `Found page...\n\t${pageForChat}\n\tChats in page: ${pageForChat.chats}`
      );

      // Add user's message to chat
      pageForChat.chats.push({ content: message, role: "user" });

      console.log(`User chat pushed: \n\t${pageForChat.chats}`);

      const assistant = classForChat.model;
      const thread = pageForChat.thread;

      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: message,
      });

      console.log(`openai thread received message...`);

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

      console.log(`run created...`);

      let runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );

      console.log(`run status at start:\n\t${runStatus.status}`);

      //polling mechanism to see if runStatus is completed
      //** make more robust (check more than completed)**
      while (
        runStatus.status !== "completed" &&
        runStatus.status !== "cancelled" &&
        runStatus.status !== "failed"
      ) {
        console.log("polling run...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

        console.log(`\trun status: ${runStatus.status}`);

        const elapsedTime = new Date().getTime() - startTime.getTime();

        // Print the elapsed time
        console.log(`Elapsed time: ${elapsedTime} milliseconds`);
        if (elapsedTime > 10000 && runStatus.status !== "cancelled") {
          await openai.beta.threads.runs.cancel(thread.id, run.id);
        }
      }

      console.log(`Polling complete, run complete...`);

      // Get the last assistant message from the messages array
      const messages = await openai.beta.threads.messages.list(thread.id);

      console.log(`messages retrieved from openai run...\n\t${messages}`);

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

      console.log(`last message grabbed...\n\t${lastMessageContent}`);

      if (!lastMessageContent) {
        throw new Error("Error: No message content found");
      }

      // If assistant message content found, add it to the chats
      if (runStatus.status === "cancelled" && lastMessageContent) {
        console.log(`Run was cancelled!`);
        console.log(`pushing last message to chats in page...`);
        pageForChat.chats.push({
          content:
            lastMessageContent +
            "\n(Last response timed out! send 'continue' to continue generating response!)",
          role: "assistant",
        });
        console.log(`message pushed...\n\t${pageForChat.chats}`);
      }

      if (runStatus.status !== "cancelled" && lastMessageContent) {
        console.log(`pushing last message to chats in page...`);
        pageForChat.chats.push({
          content: lastMessageContent,
          role: "assistant",
        });
        console.log(`message pushed...\n\t${pageForChat.chats}`);
      }

      // After completing the task
      console.log(`Attempting to save user...`);

      await user.save();
      console.log(`User saved sucessful!`);
      done(null, { chats: pageForChat.chats }); // Return the result
      break; // Break the loop on successful save
    } catch (error) {
      if (error instanceof mongoose.Error.VersionError) {
        retries++;
        console.log(
          `VersionError encountered. Retrying... Attempt: ${retries}`
        );
        if (retries >= MAX_RETRIES) {
          done(error); // Fail the job after reaching max retries
        }
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        console.error(error);
        done(error); // Pass non-VersionError to Bull
        break;
      }
    }
  }
});
