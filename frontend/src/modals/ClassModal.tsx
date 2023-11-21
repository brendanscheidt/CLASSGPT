import { Button, Typography } from "@mui/material";
import React, { useState } from "react";
import CustomizedInput from "../components/shared/CustomizedInput";

type ClassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    className: string;
    modelInstructions: string;
    /* newPageName: string; */
  }) => void;
  isEditMode?: boolean;
  existingClassName?: string;
  existingModelInstructions?: string;
};

const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEditMode = false,
  existingClassName = "",
  existingModelInstructions = "",
}) => {
  const [className, setClassName] = useState(
    isEditMode ? existingClassName : ""
  );
  const [modelInstructions, setModelInstructions] = useState(
    isEditMode ? existingModelInstructions : ""
  );
  /* const [newPageName, setNewPageName] = useState(""); */

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const classTrimmed = className.trim();
    const instructionsTrimmed = modelInstructions.trim();
    if (classTrimmed.length && instructionsTrimmed.length) {
      onSubmit({
        className: classTrimmed,
        modelInstructions: instructionsTrimmed /* newPageName */,
      }); // Pass as an object
      handleClose();
    }

    /* setNewPageName(""); */
  };

  const handleClose = () => {
    setClassName("");
    setModelInstructions("");
    /* setNewPageName(""); */
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <form onSubmit={handleSubmit}>
          <div>
            <Typography sx={{ fontSize: "30px", color: "#49acd6" }}>
              {isEditMode ? "Edit Class" : "Create A New Class"}
            </Typography>
          </div>
          <div>
            <CustomizedInput
              name="className"
              label="Class Name"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>

          {/*  <div>
            <CustomizedInput
              name="newPageName"
              label="New Page Name"
              type="text"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
            />
          </div> */}
          <div>
            <CustomizedInput
              name="modelInstructions"
              label="Tutor Instructions"
              type="text"
              value={modelInstructions}
              onChange={(e) => setModelInstructions(e.target.value)}
              multiline={true}
              placeholder="Type the instructions you wish to give your tutor for this class. ie. Talk like an old-timey british guy. Make sarcastic jokes often."
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
            {isEditMode ? "Save Changes" : "Submit"}
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

export default ClassModal;
