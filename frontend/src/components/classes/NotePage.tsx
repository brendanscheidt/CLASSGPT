import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineDelete } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import { red } from "@mui/material/colors";

type PropsType = {
  className: string;
  pageName: string;
  isEditMode: boolean;
  pageInstructions: string;
  onEditPage: (pageName: string, pageInstructions: string) => void;
  handleDeletePage: (pName: string) => Promise<void>;
};

const NotePage = ({
  className,
  pageName,
  isEditMode,
  onEditPage,
  pageInstructions,
  handleDeletePage,
}: PropsType) => {
  const editFieldRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditMode) {
      setTimeout(() => editFieldRef.current?.focus(), 0); // Set focus when entering edit mode
    }
  }, [isEditMode]);

  const handlePageClick = () => {
    if (!isEditMode) {
      navigate(`/chat/${className}/${pageName}`);
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 345,
        background: "#2b3a42", // Dark background

        boxShadow: "0px 2px 5px rgba(0,0,0,0.3)", // Soft shadow for depth
        border: "1px solid rgba(255, 255, 255, 0.1)", // Soft border
        "&:hover": {
          boxShadow: "0px 4px 10px rgba(0,0,0,0.5)", // Darker shadow on hover
        },
      }}
    >
      <CardActionArea
        sx={{
          backgroundImage: "url('../../blue.png')", // Subtle circuit texture
          backgroundSize: "cover", // Ensures the background image covers the entire Card
          backgroundRepeat: "no-repeat", // Prevents the background image from repeating
          backgroundPosition: "center", // Centers the background image
        }}
      >
        <CardContent
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={handlePageClick}
        >
          <Typography
            sx={{
              color: "white",
              fontFamily: "'Courier New', Courier, monospace",
              display: "flex",
              fontWeight: "bold", // Make the font weight bolder
              letterSpacing: "0.5px", // Adjust letter spacing
              backgroundColor: "rgba(11,54,66, 0.8)", // Add a faint background color
              justifyContent: "center",
              alignItems: "center",
              padding: "5px", // Add some padding if background color is used
              borderRadius: "5px", // Optional: for rounded corners if background color is used
            }}
            gutterBottom
            variant="h5"
            component="div"
            // Attach the click handler
          >
            {pageName.length > 10
              ? pageName.substring(0, 11) + "..."
              : pageName}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button
          onClick={() => handleDeletePage(pageName)}
          size="small"
          color="primary"
        >
          <AiOutlineDelete size={20} color={red[300]} />
        </Button>
        <Button
          onClick={() => onEditPage(pageName, pageInstructions)}
          size="small"
          color="primary"
        >
          <FiEdit size={20} />
        </Button>
      </CardActions>
    </Card>
  );
};

export default NotePage;
