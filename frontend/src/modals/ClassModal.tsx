import React, { useState } from "react";

type ClassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    className: string;
    modelInstructions: string;
    newPageName: string;
  }) => void;
};

const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [className, setClassName] = useState("");
  const [modelInstructions, setModelInstructions] = useState("");
  const [newPageName, setNewPageName] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ className, modelInstructions, newPageName }); // Pass as an object
    setClassName("");
    setModelInstructions("");
    setNewPageName("");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="className">Class Name:</label>
            <input
              id="className"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="modelInstructions">Model Instructions:</label>
            <input
              id="modelInstructions"
              type="text"
              value={modelInstructions}
              onChange={(e) => setModelInstructions(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newPageName">New Page Name:</label>
            <input
              id="newPageName"
              type="text"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
            />
          </div>
          <button type="submit">Submit</button>
          <button type="button" onClick={onClose}>
            Close
          </button>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 5,
  },
} as const;

export default ClassModal;
