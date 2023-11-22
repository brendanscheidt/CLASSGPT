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

type ClassType = {
  name: string;
  model: {
    name: string;
    instructions: string;
    tools: { type: string }[];
    model: string;
  };
  pages: {
    name: string;
    pageInstructions: string;
    chats: { id: string; role: string; content: string }[];
  }[];
};

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
  }, []);

  useEffect(() => {
    //setIsLoading(true);
    /* console.log("\n");
    console.log("useEffect triggered");
    console.log("auth?.classes:", auth?.classes);
    console.log("props.className:", props.className);
    console.log("props.pageName:", props.pageName);
    console.log("auth?.isClassesLoading:", auth?.isClassesLoading);
    console.log("props.classExists:", props.classExists); */

    const timeoutId = setTimeout(() => {
      if (!auth?.isClassesLoading && props.classExists) {
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
  }, [
    auth?.classes,
    props.className,
    props.pageName,
    auth?.isClassesLoading,
    props.classExists,
  ]);

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
      navigate(`/chat/${auth?.classes[0].name}/default`);
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
        const res = await editUserClass(
          props.className,
          className,
          modelInstructions
        );
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
        const res = await createNewClass(className, {
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
      } else {
        // Create mode
        await createNewPage(props.className, pageName, pageInstructions);
      }
      await auth?.updateClasses();
    } catch (err) {
      console.log(err);
    } finally {
      // Update all states at once
      setIsPageModalOpen(false);
      setEditingPage(null);
      setEditingPageName("");
      setEditingPageInstructions("");

      //setIsLoading(false);
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
              color={"whitesmoke"}
              sx={{ mt: 10, letterSpacing: 2, fontWeight: "bold" }}
            >
              Create The First Page For Your {props.className} Class
            </Typography>
            <Button
              onClick={handleOpenPageModal}
              sx={{
                mt: 20,
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
            color={"whitesmoke"}
            sx={{ mt: 10, letterSpacing: 2, fontWeight: "bold" }}
          >
            Create Your First Class To Start Chatting!
          </Typography>
          <Button
            onClick={() => setIsClassModalOpen(true)}
            sx={{
              mt: 20,
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
