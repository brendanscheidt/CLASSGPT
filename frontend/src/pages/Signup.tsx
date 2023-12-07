import { Box, Button, Typography } from "@mui/material";
import CustomizedInput from "../components/shared/CustomizedInput";
import { IoIosLogIn } from "react-icons/io";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

interface ErrorResponse {
  errors: { msg: string }[];
}

const Signup = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    let email = formData.get("email") as string;
    email = email.toLowerCase();
    const password = formData.get("password") as string;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!", {
        id: "signup",
      });
    }

    try {
      toast.loading("Signing Up!", { id: "signup" });
      await auth?.signup(name, email, password);
      toast.success("Signed Up Successfully!", { id: "signup" });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const responseData = err.response.data as ErrorResponse;
        if ("errors" in responseData && responseData.errors.length > 0) {
          const errorMessage = responseData.errors[0].msg;
          console.log(errorMessage);
          toast.error(errorMessage, { id: "signup" });
        } else {
          toast.error("An error occurred, but no error message was provided.", {
            id: "signup",
          });
        }
      } else {
        console.log("An unexpected error occurred");
        toast.error("An unexpected error occurred", { id: "signup" });
      }
    }
  };

  useEffect(() => {
    if (auth?.user) {
      navigate("/chat/none/none");
    }
  }, [auth, navigate]);

  return (
    <Box width={"100%"} height={"100%"} display="flex" flex={1}>
      <Box padding={8} mt={2} display={{ md: "flex", sm: "none", xs: "none" }}>
        <img
          src="classmaterials2.png"
          alt="classmaterials2"
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
              Signup
            </Typography>
            <CustomizedInput type="text" name="name" label="Name" />
            <CustomizedInput type="email" name="email" label="Email" />
            <CustomizedInput type="password" name="password" label="Password" />
            <Button
              type="submit"
              sx={{
                px: 2,
                py: 1,
                mt: 2,
                width: { md: "400px", xs: "100%" },
                borderRadius: 2,
                bgcolor: "#00fffc",
                ":hover": {
                  bgcolor: "white",
                  color: "black",
                },
              }}
              endIcon={<IoIosLogIn />}
            >
              Signup
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Signup;
