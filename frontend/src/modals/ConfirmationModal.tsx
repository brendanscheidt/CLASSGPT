type ConfirmModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationModal: React.FC<ConfirmModalProps> = ({
  onConfirm,
  onCancel,
}) => {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <p>Are you sure you want to delete the chats?</p>
        <button onClick={onConfirm}>Yes, Delete</button>
        <button onClick={onCancel}>Cancel</button>
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
    backgroundColor: "#2c2f33",
    color: "#ffffff",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
    maxWidth: "500px",
    width: "90%",
    margin: "0 auto",
    textAlign: "center",
  },
} as const;

export default ConfirmationModal;
