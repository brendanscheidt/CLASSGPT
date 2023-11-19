import { Box, Button, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import NotePage from "../classes/NotePage";
import PageModal from "../../modals/PageModal";
import {
  createNewPage,
  deleteUserChats,
  editUserPage,
} from "../../helpers/api-communicator";
import toast from "react-hot-toast";

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

const PageView = (props: PropsType) => {
  const auth = useAuth();
  const [pages, setPages] = useState<PageType>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!auth?.isClassesLoading && props.classExists) {
        auth?.classes.map((userClass) => {
          if (props.className === userClass.name) {
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
        console.log(oldName, newName);
        await editUserPage(className, oldName, newName);
        await auth?.updateClasses();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
        setIsModalOpen(false);
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

              <Button onClick={handleOpenModal}>
                Create New Page for {props.className} class
              </Button>
              <PageModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
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
            <Button onClick={handleOpenModal}>
              Create First Page for {props.className} class
            </Button>
            <PageModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
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
