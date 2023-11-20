import {
  Avatar,
  Box,
  Button,
  Drawer,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import Chat from "../components/chat/Chat";
import { RiFolderAddLine } from "react-icons/ri";
import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClassModal from "../modals/ClassModal";
import { createNewClass, createNewPage } from "../helpers/api-communicator";
import ClassSidebar from "../components/chat/ClassSidebar";
import { RxHamburgerMenu } from "react-icons/rx";

const ClassChat = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { classname, pagename } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  useLayoutEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (!auth?.isLoading && !auth?.user) {
        return navigate("/login");
      }
      /* if (classname === "none" && pagename === "none") {
        setIsModalOpen(true);
      } */
    };

    checkAuthAndRedirect();
  }, []);

  if (auth?.isLoading) {
    return <div>Loading...</div>;
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    /* if (!auth?.classes.length) {
      return;
    } */
    setIsModalOpen(false);
  };

  const handleSubmitModal = async (data: {
    className: string;
    modelInstructions: string;
    /* newPageName: string; */
  }) => {
    try {
      // Check if both fields are filled
      if (
        data.className.trim() === "" ||
        data.modelInstructions.trim() === "" /* ||
        data.newPageName.trim() === "" */
      ) {
        console.log("All fields are required.");
        // Optionally, show a user-friendly error message here
      } else {
        // Proceed with submitting data
        auth?.classes.map((userClass) => {
          if (userClass.name === data.className.trim()) {
            throw new Error("Duplicate class names not allowed.");
          }
        });
        await createNewClass(data.className, {
          name: data.className,
          instructions: data.modelInstructions,
          model: "gpt-3.5-turbo",
        });

        /* await createNewPage(data.className, data.newPageName); */

        await auth?.updateClasses();

        setIsModalOpen(false);
        toggleMobileDrawer();
        if (!auth?.isClassesLoading) {
          navigate(`/chat/${data.className}/default`);
        }
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
      {isMobile && (
        <>
          <Box sx={{ padding: "10px" }}>
            <RxHamburgerMenu
              onClick={toggleMobileDrawer} // Toggles the mobile drawer
              size={30}
              sx={{
                my: 2,
                bgcolor: "white",
                color: "black",
                fontWeight: 700,
                cursor: "pointer",
                //position: "absolute", // Add this to position your Avatar as needed
                top: theme.spacing(0), // Adjust the top position based on your theme spacing
                left: theme.spacing(5), // Adjust the left position based on your theme spacing
                margin: "10px",
              }}
            />
          </Box>

          <Drawer
            anchor="left"
            open={mobileDrawerOpen}
            onClose={toggleMobileDrawer}
            sx={{
              "& .MuiDrawer-paper": {
                bgcolor: "#111d27", // Set the background color for the Drawer's paper
              },
              width: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center", // Centers the Avatar horizontally
                p: 2, // Add some padding
              }}
            >
              <Avatar
                sx={{
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
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Button
                onClick={handleOpenModal}
                sx={{ color: "white", marginLeft: "-5px", paddingTop: "10px" }}
              >
                <RiFolderAddLine size={25} />
              </Button>
            </Box>
            <ClassModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleSubmitModal}
            />
            {auth?.classes ? (
              <ClassSidebar
                classes={auth?.classes}
                onMobileDrawerClose={toggleMobileDrawer}
              />
            ) : (
              <></>
            )}
          </Drawer>
        </>
      )}{" "}
      {!isMobile && (
        <Box
          sx={{
            display: "flex",
            width: { md: "20vw", xs: "90%" },
            minWidth: { md: "250px" },
            /* height: "100%", */
            height: { md: "85vh", xs: "20vh" },
            maxHeight: { md: "85vh", xs: "20vh" },
            bgcolor: "rgb(17,29,39)",
            borderRadius: 5,
            flexDirection: "column",
            mx: 3,
          }}
        >
          <Box
            sx={{
              overflowY: "auto",
              height: "100%", // Ensure inner container takes the full height
              "&::-webkit-scrollbar": {
                width: "0.4em",
              },
              "&::-webkit-scrollbar-track": {
                boxShadow: "inset 0 0 6px rgba(0,0,0,0.3)",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#888",
                outline: "1px solid slategrey",
                borderRadius: "2px",
              },
              scrollbarColor: "#888 slategrey",
              scrollbarWidth: "thin",
            }}
          >
            <Box
              sx={{
                textAlign: "left",
                display: "flex",
                flex: "row",
                justifyContent: "space-between",
              }}
            >
              <Button
                onClick={handleOpenModal}
                sx={{ color: "white", marginLeft: "-5px" }}
              >
                <RiFolderAddLine size={25} />
              </Button>
              <Avatar
                sx={{
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
              <div style={{ width: "48px" }}></div>
            </Box>

            <ClassModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleSubmitModal}
            />
            {auth?.classes ? (
              <ClassSidebar
                classes={auth?.classes}
                onMobileDrawerClose={toggleMobileDrawer}
              />
            ) : (
              <></>
            )}
          </Box>
        </Box>
      )}
      {classname && pagename ? (
        <Chat userClass={classname} userPage={pagename} />
      ) : (
        <Chat userClass="default" userPage="default" />
      )}
    </Box>
  );
};

export default ClassChat;
