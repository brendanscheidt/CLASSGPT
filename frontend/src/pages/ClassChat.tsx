import { Avatar, Box, Button, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import Chat from "../components/chat/Chat";
import ClassFolder from "../components/classes/ClassFolder";
import { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClassModal from "../modals/ClassModal";
import { createNewClass, createNewPage } from "../helpers/api-communicator";

const ClassChat = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { classname, pagename } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useLayoutEffect(() => {
    const checkAuthAndRedirect = () => {
      if (!auth?.isLoading && !auth?.user) {
        return navigate("/login");
      }
      auth.updateClasses();
      if (!(auth.classes.length > 0)) {
        setIsModalOpen(true);
      }
    };

    checkAuthAndRedirect();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!auth?.classes.length) {
      return;
    }
    setIsModalOpen(false);
  };

  const handleSubmitModal = async (data: {
    className: string;
    modelInstructions: string;
    newPageName: string;
  }) => {
    try {
      // Check if both fields are filled
      if (
        data.className.trim() === "" ||
        data.modelInstructions.trim() === "" ||
        data.newPageName.trim() === ""
      ) {
        console.log("All fields are required.");
        // Optionally, show a user-friendly error message here
      } else {
        // Proceed with submitting data
        await createNewClass(data.className, {
          name: data.className,
          instructions: data.modelInstructions,
          model: "gpt-3.5-turbo",
        });

        await createNewPage(data.className, data.newPageName);

        await auth?.updateClasses();

        setIsModalOpen(false);
        navigate(`/chat/${data.className}/${data.newPageName}`);
      }
    } catch (err) {
      console.log(err);
      // Optionally handle errors differently, perhaps keep the modal open
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flex: 0.2,
        flexDirection: { md: "row", xs: "column" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: { md: "20vw", xs: "90%" },
          height: "100%",
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
          Your School Notebook
        </Typography>
        <Typography sx={{ mx: "auto", fontFamily: "work sans", my: 4, p: 3 }}>
          Here are your classes and your pages for each class. Each class has a
          specialized tutor defined by your instructions!
        </Typography>
        <Button onClick={handleOpenModal}>Create New Class</Button>
        <ClassModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitModal}
        />
        {Array.isArray(auth?.classes) &&
          auth?.classes.map((singleClass, index) => {
            return (
              <ClassFolder
                key={index}
                className={singleClass.name}
                classPages={singleClass.pages}
              />
            );
          })}
      </Box>
      {classname && pagename ? (
        <Chat userClass={classname} userPage={pagename} />
      ) : (
        <Chat userClass="default" userPage="default" />
      )}
    </Box>
  );
};

export default ClassChat;
