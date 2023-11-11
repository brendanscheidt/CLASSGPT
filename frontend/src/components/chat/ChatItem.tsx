import { Box, Avatar, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function extractCodeFromString(message: string) {
  if (message.includes("```")) {
    const blocks = message.split("```");
    return blocks;
  }
}

function isCodeBlock(str: string) {
  const patterns = [
    /\bfunction\b|\bdef\b|\bclass\b|\binterface\b/, // Function and class definitions
    /\bvar\b|\blet\b|\bconst\b|\bpublic\b|\bprivate\b/, // Variable declarations
    /\bif\b|\belse\b|\bfor\b|\bwhile\b|\bdo\b|\bswitch\b|\bcase\b/, // Control structures
    /\breturn\b|\bbreak\b|\bcontinue\b/, // Common keywords
    /\bconsole\.log\b|\bprint\b|\becho\b|\bsystem\.out\.print\b/, // Print statements
    /=>|->/, // Lambdas or arrow functions
    /[\w]+\([\w\s,]*\)/, // Function calls with parameters
    /\{[\s\S]*?\}|\([\s\S]*?\)|\[[\s\S]*?\]/, // Code blocks or brackets
    /\/\/.*|\/\*[\s\S]*?\*\/|#.*|;$/, // Comments in various languages
    /\bimport\b|\binclude\b|\brequire\b/, // Import or include statements
    /".*"|'.*'|`.*`/, // Strings in various languages
    /\bnew\b|\bthis\b|\bsuper\b|\bself\b/, // Object-oriented keywords
    /&&|\|\||!|\+\+|--/, // Logical and arithmetic operators
    /==|!=|<=|>=|<|>/, // Comparison operators
    /\b\d+\b/, // Numbers
    /[^=\s]:\s*[\w\s]+/, // Type annotations or object properties
  ];
  if (patterns.some((pattern) => pattern.test(str))) {
    return [true, str.trim().split("\n")[0].trim()];
  }
  return [false, ""];
}

const ChatItem = ({
  content,
  role,
}: {
  content: string;
  role: "user" | "assistant";
}) => {
  const messageBlocks = extractCodeFromString(content);
  const auth = useAuth();
  return role == "assistant" ? (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d5612",
        gap: 2,
        borderRadius: 2,
        my: 1,
      }}
    >
      <Avatar sx={{ ml: "0" }}>
        <img src="openai.png" alt="openai" width={"30px"} />
      </Avatar>
      <Box>
        {!messageBlocks && (
          <Typography sx={{ fontSize: "20px" }}>{content}</Typography>
        )}
        {messageBlocks &&
          messageBlocks.length &&
          messageBlocks.map((block, index) => {
            const [isCode, lang] = isCodeBlock(block);
            return isCode && typeof lang === "string" ? (
              <SyntaxHighlighter
                key={index}
                style={coldarkDark}
                language={lang.toLowerCase()}
              >
                {block}
              </SyntaxHighlighter>
            ) : (
              <Typography key={index} sx={{ fontSize: "20px" }}>
                {block}
              </Typography>
            );
          })}
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d56",
        gap: 2,
        borderRadius: 2,
      }}
    >
      <Avatar sx={{ ml: "0", bgcolor: "black", color: "white" }}>
        {auth?.user?.name[0]}
        {auth?.user?.name.split(" ")[1][0]}
      </Avatar>
      <Box>
        {!messageBlocks && (
          <Typography sx={{ fontSize: "20px" }}>{content}</Typography>
        )}
        {messageBlocks &&
          messageBlocks.length &&
          messageBlocks.map((block, index) => {
            const [isCode, lang] = isCodeBlock(block);
            return isCode && typeof lang === "string" ? (
              <SyntaxHighlighter
                key={index}
                style={coldarkDark}
                language={lang.toLowerCase()}
              >
                {block}
              </SyntaxHighlighter>
            ) : (
              <Typography key={index} sx={{ fontSize: "20px" }}>
                {block}
              </Typography>
            );
          })}
      </Box>
    </Box>
  );
};

export default ChatItem;
