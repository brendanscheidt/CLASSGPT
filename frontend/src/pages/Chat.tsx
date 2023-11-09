import { Box, Avatar, Typography, Button } from "@mui/material";
import { red } from "@mui/material/colors";
import { useAuth } from "../context/AuthContext";

const chatMessages = [
  { role: "user", content: "Hi there, can you help me with my math homework?" },
  { role: "ai-assistant", content: "Of course! What do you need help with?" },
  { role: "user", content: "I’m trying to understand quadratic equations." },
  {
    role: "ai-assistant",
    content:
      "No problem, I can explain that. A quadratic equation is an equation of the second degree, meaning it contains at least one term that is squared.",
  },
  // ... more chat objects
];

const Chat = () => {
  const auth = useAuth();

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        width: "100%",
        height: "100%",
        mt: 3,
        gap: 3,
      }}
    >
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
              fontweight: 700,
            }}
          >
            {/* first letter of first and last name */}
            {auth?.user?.name[0]}
            {auth?.user?.name.split(" ")[1]
              ? auth?.user?.name.split(" ")[1][0]
              : ""}
          </Avatar>
          <Typography sx={{ mx: "auto", fontFamily: "work sans" }}>
            You are talking to a ChatBot
          </Typography>
          <Typography sx={{ mx: "auto", fontFamily: "work sans", my: 4, p: 3 }}>
            You can ask some questions related to knowledge, business, advice,
            education, etc. But avoid sharing personal information
          </Typography>
          <Button
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
      </Box>
      <Box
        sx={{
          display: "flex",
          flex: { md: 0.8, xs: 1, sm: 1 },
          flexDirection: "column",
          px: 3,
        }}
      >
        <Typography
          sx={{
            textAlign: "center",
            fontSize: "40px",
            fontWeight: "600",
            color: "white",
            mb: 2,
            mx: "auto",
          }}
        >
          Model - GPT 3.5 Turbo
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: "60vh",
            borderRadius: 3,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            overflow: "scroll",
            overflowX: "hidden",
            overflowY: "auto",
            scrollBehavior: "smooth",
          }}
        >
          {chatMessages.map((chat) => (
            <div>{chat.content}</div>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
