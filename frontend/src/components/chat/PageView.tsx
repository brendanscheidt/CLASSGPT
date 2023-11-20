import { Box, Button, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import NotePage from "../classes/NotePage";
import PageModal from "../../modals/PageModal";
import {
  createNewPage,
  deleteUserChats,
  deleteUserClass,
  editUserClass,
  editUserPage,
} from "../../helpers/api-communicator";
import toast from "react-hot-toast";
import ClassModal from "../../modals/ClassModal";
import { useNavigate } from "react-router-dom";

type PropsType = {
  className: string;
  pageName: string;
  classExists: boolean;
  pageExists: boolean;
};

type PageType = {
  name: string;
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
    chats: { id: string; role: string; content: string }[];
  }[];
};

const PageView = (props: PropsType) => {
  const auth = useAuth();
  const [pages, setPages] = useState<PageType>([]);
  const [modelInstructions, setModelInstructions] = useState("");
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [
    auth?.classes,
    props.className,
    props.pageName,
    auth?.isClassesLoading,
    props.classExists,
  ]);

  if (auth?.isClassesLoading) {
    return <div>Loading...</div>;
  }

  const handlePageNameUpdated = (oldName: string, newName: string) => {
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.name === oldName ? { ...page, name: newName } : page
      )
    );
  };

  const handleDeleteChats = async (pName: string) => {
    try {
      toast.loading("Deleting Chats", { id: "deletechats" });
      await deleteUserChats(props.className, pName);
      await auth?.updateClasses();
      toast.success("Deleted Chats Successfully", { id: "deletechats" });
    } catch (error) {
      console.log(error);
      toast.error("Deleting chats failed", { id: "deletechats" });
    }
  };

  const editPageName = async (
    className: string,
    oldName: string,
    newName: string
  ) => {
    try {
      if (newName.trim() === "") {
        console.log("Page name is required.");
      } else {
        await editUserPage(className, oldName, newName);
        await auth?.updateClasses();
      }
    } catch (err) {
      console.log(err);
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
        const res = await editUserClass(
          props.className,
          className,
          modelInstructions
        );
        await auth?.updateClasses();
        setIsClassModalOpen(false);
        navigate(`/chat/${className}/default`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenPageModal = () => {
    setIsPageModalOpen(true);
  };

  const handleClosePageModal = () => {
    setIsPageModalOpen(false);
  };

  const handleSubmitModal = async (pageName: string) => {
    try {
      // Check if both fields are filled
      if (pageName.trim() === "") {
        console.log("Page name is required.");
        // Optionally, show a user-friendly error message here
      } else {
        // Proceed with submitting data
        const res = await createNewPage(props.className, pageName);
        await auth?.updateClasses();
        setIsPageModalOpen(false);
        //navigate(`/chat/${props.className}/${pageName}`);
      }
    } catch (err) {
      console.log(err);
      // Optionally handle errors differently, perhaps keep the modal open
    }
  };

  if (props.classExists && !props.pageExists) {
    if (pages.length) {
      return (
        <Box>
          <Button onClick={handleEditClassClick}>Edit Class</Button>
          <Button onClick={handleDeleteClassClick}>Delete Class</Button>
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
          <Box>
            <Typography>
              Page manager for your {props.className} class
            </Typography>
            <Box>
              {pages.map((page, index) => {
                return (
                  <NotePage
                    key={index}
                    className={props.className}
                    pageName={page.name}
                    handleDeletePage={() => handleDeleteChats(page.name)}
                    handleEditPage={editPageName}
                    onPageNameUpdated={handlePageNameUpdated} // New prop
                  />
                );
              })}

              <Button onClick={handleOpenPageModal}>
                Create New Page for {props.className} class
              </Button>
              <PageModal
                isOpen={isPageModalOpen}
                onClose={handleClosePageModal}
                onSubmit={handleSubmitModal}
                className={props.className}
                isNew={true}
              />
            </Box>
          </Box>
        </Box>
      );
    } else {
      return (
        <Box>
          <Box>
            <Typography>
              Create your first page for your {props.className} class
            </Typography>
            <Button onClick={handleOpenPageModal}>
              Create First Page for {props.className} class
            </Button>
            <PageModal
              isOpen={isPageModalOpen}
              onClose={handleClosePageModal}
              onSubmit={handleSubmitModal}
              className={props.className}
              isNew={true}
            />
          </Box>
        </Box>
      );
    }
  } else if (!props.classExists && !props.pageExists) {
    return (
      <Box>
        <Typography sx={{ color: "white" }}>
          Create a class to start chatting!
        </Typography>
      </Box>
    );
  }
};

export default PageView;
