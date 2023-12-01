import { Box, Button, Skeleton, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import NotePage from "../classes/NotePage";
import PageModal from "../../modals/PageModal";
import {
  createNewClass,
  createNewPage,
  deleteClassPage,
  deleteUserClass,
  editUserClass,
  editUserPage,
} from "../../helpers/api-communicator";
import toast from "react-hot-toast";
import ClassModal from "../../modals/ClassModal";
import { useNavigate } from "react-router-dom";
import Divider from "@mui/material/Divider";

type PropsType = {
  className: string;
  pageName: string;
  classExists: boolean;
  pageExists: boolean;
};

type PageType = {
  name: string;
  pageInstructions: string;
  chats: {
    id: string;
    role: string;
    content: string;
  }[];
}[];

const PageView = (props: PropsType) => {
  const auth = useAuth();
  const [pages, setPages] = useState<PageType>([]);
  const [modelInstructions, setModelInstructions] = useState("");
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [editingPageName, setEditingPageName] = useState("");
  const [editingPageInstructions, setEditingPageInstructions] = useState("");

  useEffect(() => {
    setIsLoading(true); // Start loading when effect runs
    const timeoutId = setTimeout(() => {
      // ... existing logic
      setIsLoading(false); // Stop loading once data is fetched
    }, 700);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [auth?.classes]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (props.classExists) {
        auth?.classes.map((userClass) => {
          if (props.className === userClass.name) {
            const instructions = userClass.model.instructions;
            const userInstructionsRegex = /"""([^]*?)"""/;
            const match = instructions.match(userInstructionsRegex);
            const userInstructions = match ? match[1].trim() : ""; // Extract the user instructions

            setModelInstructions(userInstructions);
            setPages(userClass.pages);
          }
        });
      }
      //setIsLoading(false);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [auth?.classes, props.className, props.pageName, props.classExists]);

  if (isLoading) {
    return (
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Title Skeleton */}
          <Skeleton
            variant="text"
            width={210}
            height={60}
            animation="wave"
            sx={{ mb: 1, backgroundColor: "#272a30", borderRadius: "10px" }}
          />

          {/* Divider */}
          <Divider sx={{ width: "100%", mb: 3 }} />

          {/* Button Skeletons */}
          <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
            <Skeleton
              variant="rectangular"
              width={100}
              height={40}
              animation="wave"
              sx={{ backgroundColor: "#272a30", borderRadius: "10px" }}
            />
            <Skeleton
              variant="rectangular"
              width={100}
              height={40}
              animation="wave"
              sx={{ backgroundColor: "#272a30", borderRadius: "10px" }}
            />
          </Box>
        </Box>

        {/* Divider */}
        <Divider sx={{ width: "100%", mb: 3 }} />

        {/* Cards Skeleton */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {Array.from(new Array(3)).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width={210}
              height={118}
              animation="wave"
              sx={{ backgroundColor: "#272a30", borderRadius: "10px" }}
            />
          ))}
        </Box>

        {/* Divider */}
        <Divider sx={{ width: "100%", mt: 5, mb: 5 }} />

        {/* Create New Page Button Skeleton */}
        <Skeleton
          variant="rectangular"
          width={180}
          height={40}
          animation="wave"
          sx={{ backgroundColor: "#272a30", borderRadius: "5px" }}
        />
      </Box>
    );
  }

  const handleStartEditing = (pageName: string, pageInstructions: string) => {
    setEditingPage(pageName);
    setEditingPageName(pageName);
    setEditingPageInstructions(pageInstructions);
    setIsPageModalOpen(true);
  };

  const handleDeletePage = async (pName: string) => {
    try {
      toast.loading("Deleting Page", { id: "deletepage" });
      await deleteClassPage(props.className, pName);
      await auth?.updateClasses();
      toast.success("Deleted Page Successfully", { id: "deletepage" });
    } catch (error) {
      console.log(error);
      toast.error("Deleting page failed", { id: "deletepage" });
    }
  };

  const editPage = async (
    className: string,
    oldName: string,
    newName: string,
    pageInstructions: string
  ) => {
    try {
      if (newName.trim() === "") {
        console.log("Page name is required.");
      } else {
        //setIsLoading(true);
        await editUserPage(
          className,
          oldName,
          newName.trim(),
          pageInstructions
        );
        await auth?.updateClasses();
        //setIsLoading(false);
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const handleEditClassClick = () => {
    const classToEdit = auth?.classes.find((c) => c.name === props.className);
    if (classToEdit) {
      setIsClassModalOpen(true);
    }
  };

  const handleDeleteClassClick = async () => {
    try {
      await deleteUserClass(props.className);
      await auth?.updateClasses();

      if (props.className === auth?.classes[0].name) {
        navigate(`/chat/${auth?.classes[1].name}/default`);
      } else {
        navigate(`/chat/${auth?.classes[0].name}/default`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditClassSubmit = async ({
    className,
    modelInstructions,
  }: {
    className: string;
    modelInstructions: string;
  }) => {
    // Call API to update class with editedClassData
    // Update auth classes state if necessary
    try {
      if (className.trim() === "" || modelInstructions.trim() === "") {
        console.log("Both fields are required.");
      } else {
        //setIsLoading(true);
        await editUserClass(props.className, className, modelInstructions);
        await auth?.updateClasses();

        setIsClassModalOpen(false);
        //setIsLoading(false);
        navigate(`/chat/${className}/default`);
      }
    } catch (err) {
      console.log(err);
      //setIsLoading(false);
    }
  };

  const handleCreateClassSubmit = async ({
    className,
    modelInstructions,
  }: {
    className: string;
    modelInstructions: string;
  }) => {
    // Call API to update class with editedClassData
    // Update auth classes state if necessary
    try {
      if (className.trim() === "" || modelInstructions.trim() === "") {
        console.log("Both fields are required.");
      } else {
        setIsLoading(true);
        await createNewClass(className, {
          name: "model",
          instructions: modelInstructions,
          model: "gpt-3.5-turbo",
        });
        await auth?.updateClasses();
        setIsClassModalOpen(false);

        navigate(`/chat/${className}/default`);
        setIsLoading(false);
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const handleOpenPageModal = () => {
    setIsPageModalOpen(true);
  };

  const handleClosePageModal = () => {
    setIsPageModalOpen(false);
    setEditingPage(null);
    setEditingPageName("");
    setEditingPageInstructions("");
  };

  const handleSubmitModal = async (
    pageName: string,
    pageInstructions: string
  ) => {
    if (pageName.trim() === "") {
      console.log("Page name is required.");
      return;
    }

    //setIsLoading(true);

    try {
      if (editingPage) {
        // Edit mode
        await editPage(
          props.className,
          editingPage,
          pageName,
          pageInstructions
        );
        setIsPageModalOpen(false);
        setEditingPage(null);
        setEditingPageName("");
        setEditingPageInstructions("");
      } else {
        // Create mode
        await createNewPage(props.className, pageName, pageInstructions);
        setIsPageModalOpen(false);
        setEditingPage(null);
        setEditingPageName("");
        setEditingPageInstructions("");
        navigate(`/chat/${props.className}/${pageName}`);
      }
      await auth?.updateClasses();
    } catch (err) {
      console.log(err);
    }
  };

  if (props.classExists && !props.pageExists) {
    if (pages.length) {
      return (
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column", // Set to column to stack elements vertically
              alignItems: "center", // Align items to the center horizontally
              textAlign: "center", // Center the text
            }}
          >
            <Typography
              variant="h2"
              sx={{
                mb: 1,
                letterSpacing: 5,
                fontWeight: "bold",
              }}
            >
              {props.className.toUpperCase()}
            </Typography>
            <Divider
              sx={{ width: "100%", mb: 3, backgroundColor: "#18465c" }}
            />{" "}
            {/* Divider after the title */}
            <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
              <Button
                onClick={handleEditClassClick}
                variant="contained"
                color="primary"
                sx={{ px: 3, py: 1 }}
              >
                Edit Class
              </Button>
              <Button
                onClick={handleDeleteClassClick}
                variant="contained"
                color="secondary"
                sx={{ px: 3, py: 1 }}
              >
                Delete Class
              </Button>
            </Box>
          </Box>
          {isClassModalOpen && (
            <ClassModal
              isOpen={isClassModalOpen}
              onClose={() => setIsClassModalOpen(false)}
              onSubmit={handleEditClassSubmit}
              isEditMode={true}
              existingClassName={props.className}
              existingModelInstructions={modelInstructions}
            />
          )}
          <Divider sx={{ width: "100%", mb: 3, backgroundColor: "#18465c" }} />{" "}
          {/* Divider before the cards */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap", // This allows the cards to wrap to a new row
              gap: 2,
            }}
          >
            {pages.map((page, index) => (
              <NotePage
                key={index}
                className={props.className}
                pageName={page.name}
                isEditMode={page.name === editingPage}
                pageInstructions={page.pageInstructions}
                onEditPage={() =>
                  handleStartEditing(page.name, page.pageInstructions)
                }
                handleDeletePage={handleDeletePage}
              />
            ))}
          </Box>
          <Divider
            sx={{ width: "100%", mt: 5, mb: 5, backgroundColor: "#18465c" }}
          />{" "}
          {/* Divider before the 'Create New Page' button */}
          <Button
            onClick={handleOpenPageModal}
            variant="outlined"
            color="primary"
            sx={{ mt: 2, px: 3, py: 1 }}
          >
            Create New Page for {props.className} class
          </Button>
          <PageModal
            isOpen={isPageModalOpen}
            onClose={handleClosePageModal}
            onSubmit={handleSubmitModal}
            className={props.className}
            isNew={!editingPage} // isNew is false if editingPage is not null
            initialPageName={editingPageName}
            initialPageInstructions={editingPageInstructions}
          />
        </Box>
      );
    } else {
      return (
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column", // Set to column to stack elements vertically
              alignItems: "center", // Align items to the center horizontally
              textAlign: "center", // Center the text
            }}
          >
            <Typography
              variant="h2"
              color={"#e3b964"}
              sx={{ mt: 0, letterSpacing: 2, fontWeight: "bold" }}
            >
              Create The First Page For Your {props.className} Class
            </Typography>
            <Divider
              variant="middle"
              sx={{ width: "80%", mt: 3, backgroundColor: "whitesmoke" }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: { md: "row", xs: "column" },
                width: "100%",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mt: "30px",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingLeft: { md: "10px", xs: "none" },
                  margin: "15px",
                }}
              >
                <img
                  src="../../PageCreation.png"
                  alt="aitutor"
                  style={{ width: "200px" }}
                  className="img-border"
                />
                <Typography
                  //variant="h2"
                  color={"whitesmoke"}
                  sx={{
                    margin: "10px",
                    textAlign: "center",
                    fontWeight: "medium", // Adjusts weight
                    lineHeight: "1.6",
                    letterSpacing: "0.5px",
                    fontSize: { xs: "16px", md: "18px" },
                    textShadow: "2px 2px 4px #000000", // Drop shadow for depth
                    backgroundColor: "rgba(255, 255, 255, 0.1)", // Subtle highlight
                    padding: "5px", // Padding for highlight effect
                    borderRadius: "4px", // Rounded corners for highlight
                    transition: "all 0.3s ease-in-out", // Animation on hover
                    "&:hover": {
                      color: "#FFFFFF", // Change color on hover
                      backgroundColor: "rgba(255, 255, 255, 0.2)", // Change highlight
                    },
                  }}
                >
                  Giving your page a name will update your tutor with context
                  about the topic the page is about within this class! If your
                  class name is "Geometry", a new page name of "Trangles" will
                  update your class tutor to know the topic you want to talk
                  about is triangles in relation to geometry.
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingRight: { md: "10px", xs: "none" },
                  margin: "15px",
                }}
              >
                <img
                  src="../../PageInstructions.png"
                  alt="instructions"
                  style={{ width: "200px" }}
                  className="img-border"
                />
                <Typography
                  //variant="h2"
                  color={"whitesmoke"}
                  sx={{
                    margin: "10px",
                    textAlign: "center",
                    fontWeight: "medium", // Adjusts weight
                    lineHeight: "1.6",
                    letterSpacing: "0.5px",
                    fontSize: { xs: "16px", md: "18px" },
                    textShadow: "2px 2px 4px #000000", // Drop shadow for depth
                    backgroundColor: "rgba(255, 255, 255, 0.1)", // Subtle highlight
                    padding: "5px", // Padding for highlight effect
                    borderRadius: "4px", // Rounded corners for highlight
                    transition: "all 0.3s ease-in-out", // Animation on hover
                    "&:hover": {
                      color: "#FFFFFF", // Change color on hover
                      backgroundColor: "rgba(255, 255, 255, 0.2)", // Change highlight
                    },
                  }}
                >
                  You must also add additional instructions for your tutor
                  specific to the new page or topic you're creating. These
                  topic-specific instructions will be used to inform your tutor
                  in conjunction with the class instructions. When complete, you
                  can navigate to all of your pages within a specific class
                  folder via the sidebar on the right or by entering your class
                  management page.
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={handleOpenPageModal}
              sx={{
                mt: 5,
                fontSize: "large", // Makes the font size larger
                padding: "20px", // Adds padding to increase the button size
                border: "2px solid black", // Adds a border with 2px thickness and black color
                borderRadius: "10px",
                color: "whitesmoke",
                backgroundColor: "#1d3e57", // Sets the background color to sky blue
                "&:hover": {
                  backgroundColor: "#234a69", // Optional: Changes background color on hover
                },
              }}
            >
              Create {props.className} Page
            </Button>
            <PageModal
              isOpen={isPageModalOpen}
              onClose={handleClosePageModal}
              onSubmit={handleSubmitModal}
              className={props.className}
              isNew={!editingPage} // isNew is false if editingPage is not null
              initialPageName={editingPageName}
              initialPageInstructions={editingPageInstructions}
            />
          </Box>
        </Box>
      );
    }
  } else if (!props.classExists && !props.pageExists) {
    return (
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column", // Set to column to stack elements vertically
            alignItems: "center", // Align items to the center horizontally
            textAlign: "center", // Center the text
          }}
        >
          <Typography
            variant="h2"
            color={"#75bdd9"}
            sx={{ mt: 0, letterSpacing: 2, fontWeight: "bold" }}
          >
            Create Your First Class To Start Chatting!
          </Typography>
          <Divider
            variant="middle"
            sx={{ width: "80%", mt: 3, backgroundColor: "whitesmoke" }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: { md: "row", xs: "column" },
              width: "100%",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mt: "30px",
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingLeft: { md: "10px", xs: "none" },
                margin: "15px",
              }}
            >
              <img
                src="../../AITutor.png"
                alt="aitutor"
                style={{ width: "200px" }}
                className="img-border"
              />
              <Typography
                //variant="h2"
                color={"whitesmoke"}
                sx={{
                  margin: "10px",
                  textAlign: "center",
                  fontWeight: "medium", // Adjusts weight
                  lineHeight: "1.6",
                  letterSpacing: "0.5px",
                  fontSize: { xs: "16px", md: "18px" },
                  textShadow: "2px 2px 4px #000000", // Drop shadow for depth
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Subtle highlight
                  padding: "5px", // Padding for highlight effect
                  borderRadius: "4px", // Rounded corners for highlight
                  transition: "all 0.3s ease-in-out", // Animation on hover
                  "&:hover": {
                    color: "#FFFFFF", // Change color on hover
                    backgroundColor: "rgba(255, 255, 255, 0.2)", // Change highlight
                  },
                }}
              >
                Giving your new class a name creates a new AI tutor model for
                you! It will be updated with instructions automatically
                regarding which class it should be a tutor for. Try "Calculus
                1", or "History of Western Civilization", or "English".
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingRight: { md: "10px", xs: "none" },
                margin: "15px",
              }}
            >
              <img
                src="../../ModelInstructions.png"
                alt="instructions"
                style={{ width: "200px" }}
                className="img-border"
              />
              <Typography
                //variant="h2"
                color={"whitesmoke"}
                sx={{
                  margin: "10px",
                  textAlign: "center",
                  fontWeight: "medium", // Adjusts weight
                  lineHeight: "1.6",
                  letterSpacing: "0.5px",
                  fontSize: { xs: "16px", md: "18px" },
                  textShadow: "2px 2px 4px #000000", // Drop shadow for depth
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Subtle highlight
                  padding: "5px", // Padding for highlight effect
                  borderRadius: "4px", // Rounded corners for highlight
                  transition: "all 0.3s ease-in-out", // Animation on hover
                  "&:hover": {
                    color: "#FFFFFF", // Change color on hover
                    backgroundColor: "rgba(255, 255, 255, 0.2)", // Change highlight
                  },
                }}
              >
                You must also add additional instructions for your tutor
                specific to the new class you're creating. Try telling it to
                "provide examples wherever possible", "explain concepts using
                real life metaphors", or even silly suggestions like "always
                talk like you're on a walkie talkie"!
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={() => setIsClassModalOpen(true)}
            sx={{
              mt: 5,
              fontSize: "large", // Makes the font size larger
              padding: "20px", // Adds padding to increase the button size
              border: "2px solid black", // Adds a border with 2px thickness and black color
              borderRadius: "10px",
              color: "whitesmoke",
              backgroundColor: "#1d3e57", // Sets the background color to sky blue
              "&:hover": {
                backgroundColor: "#234a69", // Optional: Changes background color on hover
              },
            }}
          >
            Create A New Class
          </Button>
          {isClassModalOpen && (
            <ClassModal
              isOpen={isClassModalOpen}
              onClose={() => setIsClassModalOpen(false)}
              onSubmit={handleCreateClassSubmit}
              isEditMode={false}
            />
          )}
        </Box>
      </Box>
    );
  }
};

export default PageView;
