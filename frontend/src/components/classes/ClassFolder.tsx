import { Link } from "react-router-dom";
import NotePage from "./NotePage";
import { Button } from "@mui/material";

type PropsType = {
  className: string;
  classPages: {
    name: string;
    chats: {
      id: string;
      role: string;
      content: string;
    }[];
  }[];
};

const ClassFolder = (props: PropsType) => {
  return (
    <div>
      <Link to={`/chat/${props.className}/default`}>
        <div>{props.className}</div>
      </Link>
      {props.classPages.map((page, index) => (
        <NotePage
          key={index}
          pageName={page.name}
          className={props.className}
        />
      ))}
      <Button>
        <Link to={`/chat/${props.className}/new`}>New Page</Link>
      </Button>
    </div>
  );
};

export default ClassFolder;
