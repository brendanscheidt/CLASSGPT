import { Link } from "react-router-dom";

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
    </div>
  );
};

export default ClassFolder;
