import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useRef } from "react";

type PropsType = {
  className: string;
  pageName: string;
  onPageNameUpdated: (oldName: string, newName: string) => void;
  handleDeletePage: (pName: string) => Promise<void>;
  handleEditPage: (
    className: string,
    oldName: string,
    newName: string
  ) => Promise<void>;
};

const NotePage = (props: PropsType) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPageName, setEditedPageName] = useState(props.pageName);
  const editFieldRef = useRef<HTMLInputElement>(null);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setTimeout(() => editFieldRef.current?.focus(), 0); // Set focus when entering edit mode
    }
  };

  const handlePageNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPageName(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave(); // Call the save function
    }
  };

  const handleSave = async () => {
    await props.handleEditPage(props.className, props.pageName, editedPageName);
    props.onPageNameUpdated(props.pageName, editedPageName); // Update parent component
    toggleEditMode();
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardContent>
          {isEditMode ? (
            <TextField
              fullWidth
              variant="outlined"
              value={editedPageName}
              onKeyPress={handleKeyPress}
              onChange={handlePageNameChange}
              inputRef={editFieldRef}
            />
          ) : (
            <Typography
              sx={{ color: "black" }}
              gutterBottom
              variant="h5"
              component="div"
            >
              {props.pageName}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button
          onClick={() => props.handleDeletePage(props.pageName)}
          size="small"
          color="primary"
        >
          Delete
        </Button>
        {isEditMode ? (
          <Button onClick={handleSave} size="small" color="primary">
            Save
          </Button>
        ) : (
          <Button onClick={toggleEditMode} size="small" color="primary">
            Edit
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default NotePage;
