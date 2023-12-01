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
          width: "150px",
          height: "150px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 0 30px 10px #00f2ff",
          borderRadius: "50%",
        }}
      >
        <CircularProgress
          size={100}
          sx={{
            color: "#00f2ff",
          }}
        />
      </Box>
    </Box>
  );
};

export default LoadingIndicator;
