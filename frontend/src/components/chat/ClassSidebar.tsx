import React, { useState } from "react";
import List from "@mui/material/List";
import { IoAddCircleSharp } from "react-icons/io5";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import FolderIcon from "@mui/icons-material/Folder";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, ListItemButton } from "@mui/material";
import PageModal from "../../modals/PageModal";
import { createNewPage } from "../../helpers/api-communicator";
import { useAuth } from "../../context/AuthContext";
import { TbHomeEdit } from "react-icons/tb";

type PropsType = {
  classes: {
    name: string;
    model: {
      name: string;
      instructions: string;
      tools: { type: string }[];
      model: string;
    };
    pages: {
      name: string;
      chats: {
        id: string;
        role: string;
        content: string;
      }[];
    }[];
  }[];
  onMobileDrawerClose?: () => void;
};

const ClassSidebar = (props: PropsType) => {
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeClass, setActiveClass] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();

  if (auth?.isLoading) {
    return <div>Loading...</div>;
  }

  const handleClassClick = (className: string) => {
    if (openFolder === className) {
      setOpenFolder(null); // Close the folder if it's already open
    } else {
      setOpenFolder(className); // Open the clicked folder
    }
  };

  const handleAddPage = (
    event: React.MouseEvent<HTMLDivElement>,
    className: string
  ) => {
    event.stopPropagation();
    setActiveClass(className);
    setIsModalOpen(true);
  };

  const handleClassManage = (
    event: React.MouseEvent<HTMLDivElement>,
    className: string
  ) => {
    event.stopPropagation();
    setActiveClass(className);
    if (props.onMobileDrawerClose) {
      props.onMobileDrawerClose();
    }
    navigate(`/chat/${className}/default`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitModal = async (
    pageName: string,
    pageInstructions: string
  ) => {
    try {
      if (pageName.trim() === "") {
        console.log("Page name is required.");
        // Optionally, show a user-friendly error message here
      } else {
        props.classes.map((userClass) => {
          if (userClass.name === openFolder) {
            userClass.pages.map((page) => {
              if (page.name === pageName) {
                throw new Error(
                  "Duplicate page names in same class not allowed."
                );
              }
            });
          }
        });
        await createNewPage(activeClass, pageName, pageInstructions);
        setIsModalOpen(false);
        await auth?.updateClasses();
        if (props.onMobileDrawerClose) {
          props.onMobileDrawerClose();
        }

        navigate(`/chat/${activeClass}/${pageName}`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <List component="nav" aria-labelledby="nested-list-subheader">
      {props.classes.map((classItem) => (
        <React.Fragment key={classItem.name}>
          <ListItemButton onClick={() => handleClassClick(classItem.name)}>
            {" "}
            <ListItemIcon sx={{ color: "white" }}>
              {openFolder === classItem.name ? (
                <Box sx={{ display: "flex", flex: "row", padding: 0 }}>
                  <Button
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      minWidth: 0,
                      paddingRight: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <IoAddCircleSharp
                      size={25}
                      onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                        handleAddPage(event, classItem.name)
                      }
                    />
                  </Button>
                  <Button
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      minWidth: 0,
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <TbHomeEdit
                      size={25}
                      onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                        handleClassManage(event, classItem.name)
                      }
                    />
                  </Button>
                </Box>
              ) : (
                <FolderIcon />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                classItem.name.length > 10
                  ? classItem.name.substring(0, 11) + "..."
                  : classItem.name
              }
              sx={{
                "& .MuiListItemText-primary": { color: "#21a3a2" },
                paddingRight: "5px",
                paddingLeft: "-20px",
                marginLeft: "5px",
              }}
            />
            {openFolder === classItem.name ? (
              <ExpandLess sx={{ color: "white", paddingLeft: "5px" }} />
            ) : (
              <ExpandMore sx={{ color: "white", paddingLeft: "5px" }} />
            )}
          </ListItemButton>{" "}
          <Collapse
            in={classItem.name === openFolder}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {classItem.pages.map((page, index) => (
                <ListItemButton
                  key={index}
                  component={Link}
                  to={`/chat/${classItem.name}/${page.name}`}
                  onClick={() => {
                    if (props.onMobileDrawerClose) {
                      props.onMobileDrawerClose();
                    }
                  }}
                >
                  <ListItemText
                    inset
                    primary={
                      page.name.length > 10
                        ? page.name.substring(0, 11) + "..."
                        : page.name
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
          <Divider />
        </React.Fragment>
      ))}
      <PageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        className={activeClass}
        isNew={true}
      />
    </List>
  );
};

export default ClassSidebar;
