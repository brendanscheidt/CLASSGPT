import mongoose from "mongoose";
import { randomUUID } from "crypto";
const gptModelSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    object: {
        type: String,
    },
    created_at: {
        type: Number,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    instructions: {
        type: String,
        required: true,
    },
    tools: [
        {
            type: {
                type: String, // Note that 'type' is used twice: once to define the field and once as the field's type
            },
        },
    ],
    file_ids: [
        {
            type: String,
        },
    ],
    metadata: {
        type: Object,
    },
    model: {
        type: String,
        required: true,
    },
});
const chatSchema = new mongoose.Schema({
    id: {
        type: String,
        default: randomUUID(),
    },
    role: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
});
const pageSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    pageInstructions: {
        type: String,
    },
    chats: {
        type: [chatSchema],
    },
    thread: {
        type: Object,
    },
    /* thread: {
      id: {
        type: String,
      },
      object: {
        type: String,
      },
      created_at: {
        type: String,
      },
      metadata: {
        type: Object,
      },
    }, */
}, { timestamps: true });
const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    model: {
        type: gptModelSchema,
        required: true,
    },
    pages: {
        type: [pageSchema],
    },
});
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    classes: {
        type: [classSchema],
    },
});
export default mongoose.model("User", userSchema);
//# sourceMappingURL=User.js.map