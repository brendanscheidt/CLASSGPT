import { Box, Button, Typography } from "@mui/material";
import CustomizedInput from "../components/shared/CustomizedInput";
import { IoIosLogIn } from "react-icons/io";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    let email = formData.get("email") as string;
    email = email.toLowerCase();
    const password = formData.get("password") as string;

    try {
      toast.loading("Signing In!", { id: "login" });
      await auth?.login(email, password);

      // No need to check auth.user or auth.classes here
      toast.success("Signed In Successfully!", { id: "login" });

      // The redirection logic should be handled elsewhere, where state updates are reflected
    } catch (err) {
      console.log(err);
      toast.error("Signing In Failed", { id: "login" });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (auth?.isLoggedIn && auth?.user) {
        if (auth.classes.length > 0) {
          navigate(`/chat/${auth.classes[0].name}/default`);
        } else {
          navigate("/chat/none/none");
        }
      }
    }, 200); // Adjust delay as needed

    return () => clearTimeout(timeoutId);
  }, [auth?.isLoggedIn, auth?.user, auth?.classes, navigate]);

  return (
    <Box width={"100%"} height={"100%"} display="flex" flex={1}>
      <Box padding={8} mt={2} display={{ md: "flex", sm: "none", xs: "none" }}>
        <img
          src="classmaterials.png"
          alt="classmaterials"
          style={{ width: "600px" }}
          className="img-border"
        />
      </Box>
      <Box
        display={"flex"}
        flex={{ xs: 1, md: 0.5 }}
        justifyContent={"center"}
        alignItems={"center"}
        padding={2}
        ml={"auto"}
        mt={16}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            margin: "auto",
            padding: "30px",
            boxShadow: "10px 10px 20px #000",
            borderRadius: "10px",
            border: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              padding={2}
              fontWeight={600}
            >
              Login
            </Typography>
            <CustomizedInput type="email" name="email" label="Email" />
            <CustomizedInput type="password" name="password" label="Password" />
            <Button
              type="submit"
              sx={{
                px: 2,
                py: 1,
                mt: 2,
                width: "400px",
                borderRadius: 2,
                bgcolor: "#00fffc",
                ":hover": {
                  bgcolor: "white",
                  color: "black",
                },
              }}
              endIcon={<IoIosLogIn />}
            >
              Login
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
