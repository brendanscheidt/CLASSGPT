import { Box, Avatar, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useMemo, useState } from "react";
import { TypeAnimation } from "react-type-animation";

function extractCodeFromString(message: string): string[] {
  if (message.includes("```")) {
    const blocks = message.split("```");
    return blocks;
  }
  return [message];
}

function isCodeBlock(str: string) {
  if (
    str.includes("=") ||
    str.includes(";") ||
    str.includes("[") ||
    str.includes("]") ||
    str.includes("{") ||
    str.includes("}") ||
    str.includes("#") ||
    str.includes("//") ||
    str.includes("def ")
  ) {
    return true;
  }
  return false;
}
const ChatItem = ({
  content,
  role,
  isNewMessage,
}: {
  content: string;
  role: "user" | "assistant";
  isNewMessage: boolean;
}) => {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

  const messageBlocks = useMemo(
    () => extractCodeFromString(content),
    [content]
  );
  const auth = useAuth();

  useEffect(() => {
    if (isNewMessage && role === "assistant") {
      setCurrentBlockIndex(0);
    }
  }, [isNewMessage, role]);

  const handleBlockAnimationEnd = () => {
    setCurrentBlockIndex((prevIndex) => prevIndex + 1);
  };

  return role == "assistant" ? (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d5612",
        gap: 2,
        borderRadius: 2,
        my: 1,
        boxSizing: "border-box",
      }}
    >
      <Avatar sx={{ ml: "0", backgroundColor: "#dcf0f2" }}>
        <img src="classgpt.png" alt="classgpt" width={"40px"} />
      </Avatar>
      <Box>
        {!messageBlocks && (
          <Typography sx={{ fontSize: "20px" }}>{content}</Typography>
        )}
        {messageBlocks.map((block, index) => {
          const isCode = isCodeBlock(block);
          const language = block.split("\n")[0].trim().toLowerCase();
          const blockArr = block.split("\n");
          blockArr.splice(0, 1);
          const croppedBlock = blockArr.join("\n");
          // Show the block if it's been animated or is not a new message
          if (index < currentBlockIndex || !isNewMessage) {
            return isCode ? (
              <SyntaxHighlighter
                key={index}
                style={coldarkDark}
                language={language}
              >
                {croppedBlock}
              </SyntaxHighlighter>
            ) : (
              <Typography key={index} sx={{ fontSize: "20px" }}>
                {block}
              </Typography>
            );
          }
          // Animate the current block if it's new and we're at the right index
          if (isNewMessage && index === currentBlockIndex) {
            return (
              <TypeAnimation
                key={index}
                sequence={[block, 1000, () => handleBlockAnimationEnd()]}
                wrapper="div"
                repeat={0}
                cursor={true}
                speed={80}
                style={{ fontSize: "20px" }}
              />
            );
          }
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
        boxSizing: "border-box",
      }}
    >
      <Avatar sx={{ ml: "0", bgcolor: "black", color: "white" }}>
        {/* first letter of first and last name */}
        {auth?.user?.name[0]}
        {auth?.user?.name.split(" ")[1]
          ? auth?.user?.name.split(" ")[1][0]
          : ""}
      </Avatar>
      <Box>
        {!messageBlocks && (
          <Typography sx={{ fontSize: "20px" }}>{content}</Typography>
        )}
        {messageBlocks &&
          messageBlocks.length > 0 &&
          messageBlocks.map((block, index) => {
            const isCode = isCodeBlock(block);
            if (isCode) {
              const language = block.split("\n")[0].trim().toLowerCase();
              const blockArr = block.split("\n");
              blockArr.splice(0, 1);
              const croppedBlock = blockArr.join("\n");
              return (
                <SyntaxHighlighter
                  key={index}
                  style={coldarkDark}
                  language={language}
                >
                  {croppedBlock}
                </SyntaxHighlighter>
              );
            } else {
              return (
                <Typography key={index} sx={{ fontSize: "20px" }}>
                  {block}
                </Typography>
              );
            }
          })}
      </Box>
    </Box>
  );
};

export default ChatItem;
