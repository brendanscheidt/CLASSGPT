import {
  Avatar,
  Box,
  Button,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import Chat from "../components/chat/Chat";
import { RiFolderAddLine } from "react-icons/ri";
import { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClassModal from "../modals/ClassModal";
import { createNewClass } from "../helpers/api-communicator";
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
    };

    checkAuthAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (auth?.isLoading) {
    return <div>Loading...</div>;
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitModal = async (data: {
    className: string;
    modelInstructions: string;
  }) => {
    try {
      if (
        data.className.trim() === "" ||
        data.modelInstructions.trim() === ""
      ) {
        console.log("All fields are required.");
      } else {
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

        await auth?.updateClasses();

        setIsModalOpen(false);
        toggleMobileDrawer();
        navigate(`/chat/${data.className}/default`);
      }
    } catch (err) {
      console.log(err);
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
              onClick={toggleMobileDrawer}
              size={30}
              sx={{
                my: 2,
                bgcolor: "white",
                color: "black",
                fontWeight: 700,
                cursor: "pointer",
                top: theme.spacing(0),
                left: theme.spacing(5),
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
                bgcolor: "#111d27",
              },
              width: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: 2,
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
            width: { md: "20vw", xs: "94%" },
            minWidth: { md: "250px" },
            maxWidth: { md: "250px" },
            height: { md: "90vh", xs: "20vh" },
            maxHeight: { md: "90vh", xs: "20vh" },
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
