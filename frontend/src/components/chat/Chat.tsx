import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import ChatItem from "./ChatItem";
import { IoMdSend } from "react-icons/io";
import { CircularProgress } from "@mui/material";
import {
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
      const chatData = await sendChatRequest(
        content,
        props.userClass,
        props.userPage
      );

      // setChatMessages([...chatData.chats]);
      const newAIMessage: Message = chatData.chats[chatData.chats.length - 1];
      setTempNewAIMessage(newAIMessage);
      await auth?.updateClasses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message.");
    } finally {
      prevChatMessagesRef.current = chatMessages.concat(newMessage);
      setIsSending(false);

      //setNewMessageHasntBeenReceived(true);
    }

    //
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
      //toast.loading("Loading Chats", { id: "loadchats" });
      getUserChats(props.userClass, props.userPage)
        .then((data) => {
          setChatMessages([...data.chats]);
          //toast.success("Successfully loaded chats", { id: "loadchats" });
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
      auth?.classes.some((userClass) => userClass.name === props.userClass) ??
      false;
    const pageExists =
      auth?.classes.some((userClass) =>
        userClass.pages.some((page) => page.name === props.userPage)
      ) ?? false;

    setIsClassInUser(classExists);
    setIsPageInClass(pageExists);
  }, [auth, auth?.classes, props.userClass, props.userPage]);

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
          //mt: 3,
          gap: 3,
          // px: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flex: { md: 0.98, xs: 1, sm: 1 },
            flexDirection: "column",
            px: 3,
            /* height: "60vh",
            overflowY: "auto", */
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
                textAlign: "center", // Center the text
                flexGrow: 1, // Allow it to take available space
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
              justifyContent: "space-between", // Distribute space between elements
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
                display: "inline-flex", // Use 'inline-flex' for the button to only take up as much space as needed
                alignItems: "center",
                justifyContent: "center", // Center the icon horizontally
                color: "white",
                fontWeight: "700",
                borderRadius: "10px",
                bgcolor: red[300],
                ":hover": {
                  bgcolor: red.A400,
                },
                minWidth: 0, // Set the minWidth to a smaller value or 0
                padding: "5px", // Reduce horizontal padding
                whiteSpace: "nowrap", // Prevent text wrapping
              }}
            >
              <VscClearAll size={25} />
            </Button>

            <Link
              style={{ textDecoration: "none" }} // Centers the Link itself
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
                <TbHomeEdit
                  size={20}
                  //style={{ marginRight: { md: "8px", xs: 0 } }}
                />
                <Typography
                  sx={{
                    display: { xs: "none", md: "block" }, // Hide text on xs, show on md and above
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
            {/* {chatMessages.map((chat, index) => {
              const isNewMessage =
                (prevChatMessagesRef.current &&
                  index >= prevChatMessagesRef.current.length &&
                  newMessageHasntBeenReceived) ??
                false;

              return (
                <ChatItem
                  content={chat.content}
                  role={chat.role}
                  isNewMessage={isNewMessage}
                  key={index}
                  onAnimationComplete={handleAnimationComplete}
                />
              );
            })} */}
            <Box position={"relative"} width={"100%"} maxWidth={"100%"}>
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
