import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomizedInput from "../components/shared/CustomizedInput";

type ClassModalProps = {
  isOpen: boolean;
  className: string;
  isNew: boolean;
  initialPageName?: string;
  initialPageInstructions?: string;
  onClose: () => void;
  onSubmit: (pageName: string, pageInstructions: string) => void;
};

const PageModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  className,
  isNew,
  initialPageName = "",
  initialPageInstructions = "",
}) => {
  const [pageName, setPageName] = useState(initialPageName);
  const [pageInstructions, setPageInstructions] = useState(
    initialPageInstructions
  );

  useEffect(() => {
    setPageName(initialPageName);
    setPageInstructions(initialPageInstructions);
  }, [initialPageName, initialPageInstructions]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pageInstructions.length && pageName.length) {
      onSubmit(pageName.trim(), pageInstructions.trim()); // Pass as an object
      setPageName("");
      setPageInstructions("");
    }
  };

  const handleClose = () => {
    setPageName("");
    setPageInstructions("");
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  if (!isNew) {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <form onSubmit={handleSubmit}>
            <div>
              <Typography sx={{ fontSize: "30px", color: "#49acd6" }}>
                Edit {className} Page
              </Typography>
            </div>
            <div>
              {/* <label htmlFor="className">Class Name:</label> */}
              <CustomizedInput
                name="pagename"
                label="Page Name"
                type="text"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
              />
            </div>
            <div>
              {/* <label htmlFor="className">Class Name:</label> */}
              <CustomizedInput
                name="pageinstructions"
                label="Topic Instructions"
                type="text"
                value={pageInstructions}
                onChange={(e) => setPageInstructions(e.target.value)}
                multiline={true}
                placeholder="Type the instructions you want your tutor to have for this specific page or topic. ie. This page is about geometry and area."
              />
            </div>
            <Button
              sx={{
                color: "#333",
                bgcolor: "#00fffc",
                ":hover": {
                  bgcolor: "#029695",
                },
                margin: "10px",
              }}
              type="submit"
            >
              Submit
            </Button>
            <Button
              sx={{
                color: "white",
                bgcolor: "#51538f",
                ":hover": {
                  bgcolor: "#6466b3",
                },
                margin: "10px",
              }}
              type="button"
              onClick={handleClose}
            >
              Close
            </Button>
          </form>
        </div>
      </div>
    );
  } else
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <form onSubmit={handleSubmit}>
            <div>
              <Typography sx={{ fontSize: "30px", color: "#49acd6" }}>
                Create New {className} Page
              </Typography>
            </div>
            <div>
              {/* <label htmlFor="className">Class Name:</label> */}
              <CustomizedInput
                name="pagename"
                label="Page Name"
                type="text"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
              />
            </div>
            <div>
              {/* <label htmlFor="className">Class Name:</label> */}
              <CustomizedInput
                name="pageinstructions"
                label="Topic Instructions"
                type="text"
                value={pageInstructions}
                onChange={(e) => setPageInstructions(e.target.value)}
                multiline={true}
                placeholder="Type the instructions you want your tutor to have for this specific page or topic. ie. This page is about geometry and area."
              />
            </div>
            <Button
              sx={{
                color: "#333",
                bgcolor: "#00fffc",
                ":hover": {
                  bgcolor: "#029695",
                },
                margin: "10px",
              }}
              type="submit"
            >
              Submit
            </Button>
            <Button
              sx={{
                color: "white",
                bgcolor: "#51538f",
                ":hover": {
                  bgcolor: "#6466b3",
                },
                margin: "10px",
              }}
              type="button"
              onClick={handleClose}
            >
              Close
            </Button>
          </form>
        </div>
      </div>
    );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent dark overlay
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#2c2f33", // Dark background color
    color: "#ffffff", // White text color for contrast
    padding: "20px",
    borderRadius: "15px", // Increased border-radius for rounded edges
    boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)", // Adding a subtle shadow for depth
    maxWidth: "500px", // Max width for better aesthetics on larger screens
    width: "90%", // Responsive width
    margin: "0 auto", // Centering modal
    textAlign: "center", // Center align text
    // Modern, sleek font
  },
} as const;

export default PageModal;
