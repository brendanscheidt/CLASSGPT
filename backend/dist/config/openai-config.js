import { OpenAI } from "openai";
export const openai = () => {
    const newOpenai = new OpenAI({
        apiKey: process.env.OPEN_AI_SECRET,
    });
    return newOpenai;
};
//# sourceMappingURL=openai-config.js.map