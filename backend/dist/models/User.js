import mongoose from "mongoose";
import { randomUUID } from "crypto";
const gptModelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    instructions: {
        type: String,
        required: true,
    },
    tools: {
        type: [{ type: String }],
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
    chats: {
        type: [chatSchema],
    },
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