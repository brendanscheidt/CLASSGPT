import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const LoadingIndicator = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Box
        sx={{
          width: "150px", // Increase the size of the wrapper for a bigger glow
          height: "150px", // Same as width
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 0 30px 10px #00f2ff", // Increase spread and size of the glow
          borderRadius: "50%", // Circular shape
        }}
      >
        <CircularProgress
          size={100}
          sx={{
            color: "#00f2ff", // Neon blue color
          }}
        />
      </Box>
    </Box>
  );
};

export default LoadingIndicator;
