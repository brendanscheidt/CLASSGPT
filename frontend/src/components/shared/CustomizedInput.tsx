import { TextField } from "@mui/material";

type Props = {
  name: string;
  label: string;
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  onEnterPress?: () => void;
};

const CustomizedInput = ({
  name,
  label,
  type,
  value,
  onChange,
  multiline = false,
  rows = 4,
  placeholder = "",
  onEnterPress,
}: Props) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && multiline) {
      e.preventDefault(); // Prevent default behavior (new line)
      onEnterPress?.(); // Call the onEnterPress function
    }
  };

  return (
    <TextField
      margin="normal"
      InputLabelProps={{ style: { color: "white" } }}
      name={name}
      label={label}
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={multiline ? handleKeyDown : undefined}
      multiline={multiline}
      rows={multiline ? rows : 1}
      placeholder={placeholder}
      sx={{
        width: "100%",
        "& .MuiInputBase-input": {
          color: "white", // Input text color
          "&::placeholder": {
            color: "white", // Placeholder text color
          },
        },
        "& label.Mui-focused": {
          color: "white", // Label color when focused
        },
        "& label": {
          color: "white", // Label color
        },
        "& .MuiInput-underline:before": {
          borderBottomColor: "white", // Underline color before focus
        },
        "& .MuiInput-underline:after": {
          borderBottomColor: "white", // Underline color after focus
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "white", // Border color
          },
          "&:hover fieldset": {
            borderColor: "white", // Hover border color
          },
          "&.Mui-focused fieldset": {
            borderColor: "white", // Border color when focused
          },
        },
        "& .MuiInputBase-inputMultiline": {
          // Ensures the scrollbar is applied to the multiline text field
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "0.4em",
          },
          "&::-webkit-scrollbar-track": {
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
            webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0, 0.1)",
            outline: "1px solid slategrey",
            borderRadius: "2px",
          },
          scrollbarColor: "darkgrey slategrey", // For Firefox/Edge
          scrollbarWidth: "thin", // For Firefox/Edge
        },
      }}
    />
  );
};

export default CustomizedInput;
