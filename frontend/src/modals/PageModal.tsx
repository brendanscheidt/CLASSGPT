import React, { useState } from "react";

type ClassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pageName: string) => void;
};

const PageModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [pageName, setPageName] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(pageName); // Pass as an object
    setPageName("");
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
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
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

export default PageModal;
