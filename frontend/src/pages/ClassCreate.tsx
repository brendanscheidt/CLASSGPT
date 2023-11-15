import { Box, Button, Typography } from "@mui/material";
import CustomizedInput from "../components/shared/CustomizedInput";
import { IoIosLogIn } from "react-icons/io";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createNewClass } from "../helpers/api-communicator";

const ClassCreate = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isNew, setIsNew] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const modelInstructions = formData.get("modelInstructions") as string;

    try {
      toast.loading("Creating New Class!", { id: "class" });
      await createNewClass(name, {
        name: name + " tutor",
        instructions: modelInstructions,
        model: "gpt-3.5-turbo",
      });
      toast.success("Class Created Successfully!", { id: "class" });
      auth?.updateClasses();
      navigate(`/chat/${name}/default`);
    } catch (err) {
      console.log(err);
      toast.error("Creating New Class Failed.", { id: "class" });
    }
  };

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      if (!auth?.isLoading && !auth?.user) {
        return navigate("/login");
      }
    };

    checkAuthAndRedirect();
  }, [auth?.isLoading, auth?.user, navigate]);

  useEffect(() => {
    const checkNew = () => {
      if (!auth?.classes) {
        console.log(auth?.classes);
        setIsNew(true);
      }
    };

    checkNew();
  }, [auth?.classes, auth]);

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
            {isNew ? (
              <Typography
                variant="h4"
                textAlign="center"
                padding={2}
                fontWeight={600}
              >
                Create Your First Class
              </Typography>
            ) : (
              <Typography
                variant="h4"
                textAlign="center"
                padding={2}
                fontWeight={600}
              >
                Create Class
              </Typography>
            )}

            <CustomizedInput type="name" name="name" label="Class Name" />
            <CustomizedInput
              type="modelInstructions"
              name="modelInstructions"
              label="Model Instructions"
            />
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
              Create Class
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default ClassCreate;
