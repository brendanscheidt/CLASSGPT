import { Box, Avatar, Typography, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useMemo, useRef, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import KaTeX CSS

function extractCodeFromString(message: string): string[] {
  if (message.includes("```")) {
    const blocks = message.split("```");
    return blocks;
  }
  return [message];
}

function isCodeBlock(str: string) {
  if (
    (str.includes("java") ||
      str.includes("javascript") ||
      str.includes("typescript") ||
      str.includes("julia") ||
      str.includes("makefile") ||
      str.includes("php") ||
      str.includes("sql") ||
      str.includes("python") ||
      str.includes("html") ||
      str.includes("xhtml") ||
      str.includes("css") ||
      str.includes("cpp") ||
      str.includes("csharp") ||
      str.includes("bash")) &&
    (str.includes("=") ||
      str.includes(";") ||
      str.includes("[") ||
      str.includes("]") ||
      str.includes("{") ||
      str.includes("}") ||
      str.includes("#") ||
      str.includes("//") ||
      str.includes("def "))
  ) {
    return true;
  }
  return false;
}
const ChatItem = ({
  content,
  role,
  isNewMessage,
  isProcessing,
  style,
  onContentHeightChange,
  onAnimationStart,
  onAnimationComplete,
}: {
  content: string;
  role: "user" | "assistant";
  isNewMessage: boolean;
  isProcessing?: boolean;
  style?: React.CSSProperties;
  onAnimationComplete: () => void;
  onAnimationStart: () => void;
  onContentHeightChange: () => void;
}) => {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [lastHeight, setLastHeight] = useState(0);

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

  useEffect(() => {
    const checkHeightAndScroll = () => {
      if (contentRef.current) {
        const currentHeight = contentRef.current.clientHeight;
        if (currentHeight !== lastHeight) {
          onContentHeightChange();
          setLastHeight(currentHeight);
        }
      }
    };

    const interval = setInterval(checkHeightAndScroll, 200); // Check every 200ms

    return () => clearInterval(interval);
  }, [lastHeight, onContentHeightChange]);

  const renderContent = (block: string, index: number) => {
    if (isCodeBlock(block)) {
      const language = block.split("\n")[0].trim().toLowerCase();
      const blockArr = block.split("\n");
      blockArr.splice(0, 1);
      const croppedBlock = blockArr.join("\n");
      return (
        <SyntaxHighlighter key={index} style={coldarkDark} language={language}>
          {croppedBlock}
        </SyntaxHighlighter>
      );
    } else {
      return (
        <ReactMarkdown
          key={index}
          children={block}
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          className="markdown-content"
        />
      );
    }
  };

  const handleBlockAnimationStart = () => {
    if (isNewMessage && role === "assistant") {
      onAnimationStart(); // Notify when typing animation starts
    }
  };

  const handleBlockAnimationEnd = () => {
    setCurrentBlockIndex((prevIndex) => prevIndex + 1);
    if (currentBlockIndex === messageBlocks.length - 1) {
      onAnimationComplete();
      localStorage.setItem("animationPlayed", "true");
    }
  };

  return role === "assistant" ? (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d5612",
        gap: 2,
        borderRadius: 2,
        my: 1,
        boxSizing: "border-box",
        position: "relative",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        maxWidth: "100%",
      }}
      style={style}
    >
      {isProcessing && (
        <CircularProgress
          size={40} // Adjust the size as needed
          thickness={6}
          sx={{
            color: "#ecaaf2", // Adjust color as needed
            position: "absolute",
            //top: "-5px", // Adjust these values as needed for positioning
            //left: "-5px",
            zIndex: 1,
          }}
        />
      )}
      <Avatar
        sx={{ ml: "0", backgroundColor: "#dcf0f2", position: "relative" }}
      >
        <img src="/../classgpt.png" alt="classgpt" width={"40px"} />
      </Avatar>
      <Box>
        {!messageBlocks && (
          <Typography sx={{ fontSize: "20px" }}>{content}</Typography>
        )}
        {messageBlocks.map((block, index) => {
          if (index < currentBlockIndex || !isNewMessage) {
            return renderContent(block, index);
          }
          if (isNewMessage && index === currentBlockIndex) {
            return (
              <div ref={contentRef}>
                <TypeAnimation
                  key={index}
                  sequence={[
                    () => handleBlockAnimationStart(),
                    block,
                    1000,
                    () => handleBlockAnimationEnd(),
                  ]}
                  wrapper="div"
                  repeat={0}
                  cursor={true}
                  speed={99}
                  style={{ fontSize: "20px", lineHeight: "1.5" }}
                />
              </div>
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
        wordWrap: "break-word",
        overflowWrap: "break-word",
        maxWidth: "100%",
      }}
    >
      <Avatar sx={{ ml: "0", bgcolor: "black", color: "white" }}>
        {/* first letter of first and last name */}
        {auth?.user?.name[0]}
        {auth?.user?.name.split(" ")[1]
          ? auth?.user?.name.split(" ")[1][0]
          : ""}
      </Avatar>
      <Box
        sx={{
          wordBreak: "break-all", // Or 'break-word' depending on preference
          overflowWrap: "break-word",
          width: "100%",
        }}
      >
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
              // Split by newlines and join with two spaces and a newline
              const markdownFormattedText = block.split("\n").join("  \n");
              return (
                <ReactMarkdown
                  key={index}
                  children={markdownFormattedText}
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  className="markdown-content"
                />
              );
            }
          })}
      </Box>
    </Box>
  );
};

export default ChatItem;
