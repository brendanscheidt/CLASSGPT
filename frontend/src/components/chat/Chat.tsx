import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import ChatItem from "./ChatItem";
import { IoMdSend } from "react-icons/io";
import { CircularProgress } from "@mui/material";
import {
  checkJobStatus,
  deleteUserChats,
  getUserChats,
  sendChatRequest,
} from "../../helpers/api-communicator";
import toast from "react-hot-toast";
import { red } from "@mui/material/colors";
import PageView from "./PageView";
import { Link } from "react-router-dom";
import { TbHomeEdit } from "react-icons/tb";
import { VscClearAll } from "react-icons/vsc";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type PropsType = {
  userClass: string;
  userPage: string;
};

const Chat = (props: PropsType) => {
  const [isSending, setIsSending] = useState(false);
  const [tempNewAIMessage, setTempNewAIMessage] = useState<Message | null>(
    null
  );
  const [isClassInUser, setIsClassInUser] = useState(false);
  const [isPageInClass, setIsPageInClass] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const auth = useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const prevChatMessagesRef = useRef<Message[] | null>(null);
  const [newMessageHasntBeenReceived, setNewMessageHasntBeenReceived] =
    useState(true);
  const [tempProcessingMessage, setTempProcessingMessage] =
    useState<Message | null>(null);

  const placeholderMessages: string[] = [
    "Beep boop! I'm on it...",
    "Activating all my silicon neurons...",
    "Consulting with the digital brain...",
    "Decoding the complexities of your query...",
    "Casting a net into the ocean of data...",
    "Fetching insights from the AI realm...",
    "Synchronizing with the knowledge matrix...",
    "Processing... I'm on the verge of a breakthrough!",
    "Evaluating multiple educational perspectives...",
    "Gleaning wisdom from the AI knowledge orchard...",
    "Still processing...",
    "Assembling bits of genius for you...",
    "Just a second, I'm almost there...",
    "Orchestrating a symphony of data...",
    "Generating a tailored educational response...",
    "Concocting the perfect blend of answers and insight...",
    "Hang tight, almost done...",
  ];
  const messageIndex = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const content = inputRef.current?.value as string;
    if (content.trim()) {
      if (inputRef && inputRef.current) {
        inputRef.current.value = "";
      }
    }
    localStorage.removeItem("animationPlayed");
    const newMessage: Message = { role: "user", content };
    setChatMessages((prev) => [...prev, newMessage]);
    setIsSending(true);

    try {
      // Send the chat request and get the job ID
      const { jobId } = await sendChatRequest(
        content,
        props.userClass,
        props.userPage
      );

      // Function to poll for job status
      const pollJobStatus = async () => {
        try {
          const status = await checkJobStatus(jobId);
          console.log(status);
          if (status.state === "completed") {
            const newAIMessage: Message =
              status.result.chats[status.result.chats.length - 1];
            setTempNewAIMessage(newAIMessage);
            setIsSending(false);
            clearInterval(pollInterval); // Stop polling
          }
        } catch (error) {
          console.error(error);
          toast.error("Failed to check job status.");
        }
      };

      // Start polling
      const pollInterval = setInterval(pollJobStatus, 2000); // Poll every 2 seconds
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message.");
      setIsSending(false);
    } finally {
      prevChatMessagesRef.current = chatMessages.concat(newMessage);
    }
  };

  const handleDeleteChats = async () => {
    try {
      toast.loading("Deleting Chats", { id: "deletechats" });
      await deleteUserChats(props.userClass, props.userPage);
      setChatMessages([]);
      await auth?.updateClasses();
      toast.success("Deleted Chats Successfully", { id: "deletechats" });
    } catch (error) {
      console.log(error);
      toast.error("Deleting chats failed", { id: "deletechats" });
    }
  };

  useLayoutEffect(() => {
    if (auth?.isLoggedIn && auth.user) {
      getUserChats(props.userClass, props.userPage)
        .then((data) => {
          setChatMessages([...data.chats]);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Loading Failed", { id: "loadchats" });
        });
    }
  }, [auth, props.userClass, props.userPage]);

  useEffect(() => {
    scrollToBottom();
  }, [
    chatMessages,
    prevChatMessagesRef,
    tempNewAIMessage,
    newMessageHasntBeenReceived,
    tempProcessingMessage,
  ]);

  useEffect(() => {
    if (tempNewAIMessage) {
      setChatMessages((prev) => [...prev, tempNewAIMessage]); // Add the new AI message to the chatMessages
      setTempNewAIMessage(null); // Reset the temporary message
      setNewMessageHasntBeenReceived(true); // Set flag to trigger typing animation
    }
  }, [tempNewAIMessage]);

  useEffect(() => {
    if (!prevChatMessagesRef.current && chatMessages.length) {
      prevChatMessagesRef.current = chatMessages;
    }
  }, [chatMessages]);

  useEffect(() => {
    const classExists =
      auth?.classes?.some((userClass) => userClass.name === props.userClass) ??
      false;
    const pageExists =
      auth?.classes?.some((userClass) =>
        userClass.pages.some((page) => page.name === props.userPage)
      ) ?? false;

    setIsClassInUser(classExists);
    setIsPageInClass(pageExists);
  }, [auth, auth?.classes, props.userClass, props.userPage]);

  useEffect(() => {
    let interval: number;

    if (isSending) {
      // Immediately set the first temporary processing message
      setTempProcessingMessage({
        role: "assistant",
        content: placeholderMessages[0],
      });
      messageIndex.current = 1;

      // Set an interval to cycle through processing messages
      interval = setInterval(() => {
        setTempProcessingMessage({
          role: "assistant",
          content: placeholderMessages[messageIndex.current],
        });
        messageIndex.current =
          (messageIndex.current + 1) % placeholderMessages.length;
      }, 5000) as unknown as number; // Adjust the interval duration as needed
    } else {
      // Clear the temporary processing message when not sending
      setTempProcessingMessage(null);
    }

    return () => clearInterval(interval);
  }, [isSending]);

  if (auth?.isLoading) {
    return <div>Loading...</div>;
  }

  if (isClassInUser && isPageInClass) {
    return (
      <Box
        sx={{
          display: "flex",
          flex: 1,
          width: "100%",
          height: "100%",
          gap: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flex: { md: 0.98, xs: 1, sm: 1 },
            flexDirection: "column",
            px: 3,
          }}
        >
          <Box
            sx={{
              mb: "10px",
              display: "flex",
              flex: "row",
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "24px", md: "40px" },
                color: "white",
                fontWeight: "600",
                textAlign: "center",
                flexGrow: 1,
                whiteSpace: "nowrap",
              }}
            >
              {props.userClass === "default" || props.userPage === "default"
                ? ""
                : `${props.userClass.toUpperCase()}`}
              {" - ("}
              {props.userClass === "default" || props.userPage === "default"
                ? ""
                : `${props.userPage}`}
              {")"}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#0a1c30",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <Button
              onClick={handleDeleteChats}
              className="button-svg-icon"
              id="deleteChatsButton"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "700",
                borderRadius: "10px",
                bgcolor: red[300],
                ":hover": {
                  bgcolor: red.A400,
                },
                minWidth: 0,
                padding: "5px",
                whiteSpace: "nowrap",
              }}
            >
              <VscClearAll size={25} />
            </Button>

            <Link
              style={{ textDecoration: "none" }}
              to={`/chat/${props.userClass}/default`}
            >
              <Button
                sx={{
                  display: "flex",

                  borderRadius: "10px",
                  color: "white",
                  backgroundColor: "#355b87",
                  ":hover": {
                    bgcolor: "#1a2b40",
                  },
                }}
              >
                <TbHomeEdit size={20} />
                <Typography
                  sx={{
                    display: { xs: "none", md: "block" },
                    marginLeft: { xs: "none", md: "10px" },
                  }}
                >
                  Manage {props.userClass} Class
                </Typography>
              </Button>
            </Link>
          </Box>

          <Box
            sx={{
              width: "100%",
              height: "60vh",
              borderRadius: 3,
              mx: "auto",
              paddingRight: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "scroll",
              overflowX: "hidden",
              overflowY: "auto",
              scrollBehavior: "smooth",
              "&::-webkit-scrollbar": {
                width: "0.4em",
              },
              "&::-webkit-scrollbar-track": {
                boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
                webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0, 0.1)",
                outline: "1px solid slategrey",
                position: "relative",
                borderRadius: "2px",
              },
              // Add other browser-specific styles if needed
              scrollbarColor: "rgba(0,0,0, 0.1) slategrey", // For Firefox
              scrollbarWidth: "thin", // For Firefox
            }}
          >
            <Box
              id="chatContainer"
              position={"relative"}
              width={"100%"}
              maxWidth={"100%"}
            >
              {chatMessages.map((chat, index) => {
                const animationPlayed =
                  localStorage.getItem("animationPlayed") === "true";
                const isNewMessage =
                  index === chatMessages.length - 1 && !animationPlayed;

                return (
                  <ChatItem
                    content={chat.content}
                    role={chat.role}
                    isNewMessage={isNewMessage}
                    key={index}
                    onContentHeightChange={scrollToBottom}
                    onAnimationStart={() => {
                      if (
                        tempNewAIMessage &&
                        index === chatMessages.length - 1
                      ) {
                        setChatMessages((prev) => [...prev, tempNewAIMessage]);
                        setTempNewAIMessage(null);
                      }
                    }}
                    onAnimationComplete={() => {
                      if (index === chatMessages.length - 1) {
                        setNewMessageHasntBeenReceived(false); // Reset flag once animation completes
                      }
                    }}
                  />
                );
              })}
              {/* Temp message waiting for response */}
              {tempProcessingMessage && (
                <ChatItem
                  content={tempProcessingMessage.content}
                  role={tempProcessingMessage.role}
                  isNewMessage={false} // Adjust as needed
                  // Add any other necessary props
                  onContentHeightChange={scrollToBottom}
                  onAnimationStart={scrollToBottom}
                  onAnimationComplete={scrollToBottom}
                  isProcessing={true}
                  style={{
                    animation: "pulseOpacity 2s infinite", // Adjust '2s' as needed for speed
                  }}
                />
              )}
            </Box>

            <div ref={messagesEndRef} />
          </Box>
          <div
            style={{
              width: "100%",
              borderRadius: 8,
              backgroundColor: isSending ? "#0E1620" : "#111b27",
              display: "flex",
              margin: "auto",
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            {" "}
            <input
              disabled={isSending}
              placeholder={
                isSending
                  ? "Waiting for response..."
                  : `Message Your ${props.userClass} Tutor...`
              }
              ref={inputRef}
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              style={{
                width: "100%",
                backgroundColor: "transparent",
                padding: "30px",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "20px",
                cursor: isSending ? "wait" : "text",
              }}
            />
            <IconButton
              onClick={handleSubmit}
              disabled={isSending}
              sx={{ color: "white", mx: 1 }}
            >
              {isSending ? (
                <CircularProgress sx={{ color: "#03fcfc" }} size={24} />
              ) : (
                <IoMdSend />
              )}
            </IconButton>
          </div>
        </Box>
      </Box>
    );
  } else {
    return (
      <Box sx={{ width: "100%" }}>
        <PageView
          className={props.userClass}
          pageName={props.userPage}
          classExists={isClassInUser}
          pageExists={isPageInClass}
        />
      </Box>
    );
  }
};

export default Chat;
