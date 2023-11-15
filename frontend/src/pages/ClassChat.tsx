import { Avatar, Box, Button, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { red } from "@mui/material/colors";
import Chat from "../components/chat/Chat";
import ClassFolder from "../components/classes/ClassFolder";
import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteUserChats } from "../helpers/api-communicator";

const ClassChat = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const checkAuthAndRedirect = () => {
      if (!auth?.isLoading && !auth?.user) {
        return navigate("/login");
      }
    };

    checkAuthAndRedirect();
  }, [auth?.isLoading, auth?.user, navigate]);

  const handleDeleteChats = async (userClass: string) => {
    try {
      toast.loading("Deleting Chats", { id: "deletechats" });
      await deleteUserChats(userClass);
      //setChatMessages([]);
      toast.success("Deleted Chats Successfully", { id: "deletechats" });
    } catch (error) {
      console.log(error);
      toast.error("Deleting chats failed", { id: "deletechats" });
    }
  };

  return (
    <Box
      sx={{
        display: { md: "flex", xs: "none", sm: "none" },
        flex: 0.2,
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "60vh",
          bgcolor: "rgb(17,29,39)",
          borderRadius: 5,
          flexDirection: "column",
          mx: 3,
        }}
      >
        <Avatar
          sx={{
            mx: "auto",
            my: 2,
            bgcolor: "white",
            color: "black",
            fontWeight: 700,
          }}
        >
          {/* first letter of first and last name */}
          {auth?.user?.name[0]}
          {auth?.user?.name.split(" ")[1]
            ? auth?.user?.name.split(" ")[1][0]
            : ""}
        </Avatar>
        <Typography sx={{ mx: "auto", fontFamily: "work sans" }}>
          You are talking to a ChatBOT
        </Typography>
        <Typography sx={{ mx: "auto", fontFamily: "work sans", my: 4, p: 3 }}>
          You can ask some questions related to Knowledge, Business, Advices,
          Education, etc. But avoid sharing personal information
        </Typography>
        {Array.isArray(auth?.classes) &&
          auth?.classes.map((singleClass, index) => {
            return (
              <ClassFolder
                key={index}
                className={singleClass.name}
                classChats={singleClass.chats}
              />
            );
          })}
        <Button
          onClick={handleDeleteChats}
          sx={{
            width: "200px",
            my: "auto",
            color: "white",
            fontWeight: "700",
            borderRadius: 3,
            mx: "auto",
            bgcolor: red[300],
            ":hover": {
              bgcolor: red.A400,
            },
          }}
        >
          Clear Conversation
        </Button>
      </Box>
      <Chat userClass="default" />
    </Box>
  );
};

export default ClassChat;
