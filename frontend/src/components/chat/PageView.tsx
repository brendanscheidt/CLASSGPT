import { Box, Button, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import NotePage from "../classes/NotePage";
import PageModal from "../../modals/PageModal";
import { createNewPage } from "../../helpers/api-communicator";
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

const PageView = (props: PropsType) => {
  const auth = useAuth();
  const [pages, setPages] = useState<PageType>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (props.classExists) {
      auth?.classes.map((userClass) => {
        if (props.className === userClass.name) {
          setPages(userClass.pages);
        }
      });
    }
  }, [auth?.classes, props.className, props.pageName]);

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
        navigate(`/chat/${props.className}/${pageName}`);
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
            />
          </Box>
        </Box>
      );
    }
  } else if (!props.classExists || !props.pageExists) {
    <Box></Box>;
  }
};

export default PageView;
