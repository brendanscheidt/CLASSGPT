import { Link } from "react-router-dom";

type PropsType = {
  className: string;
  classChats: {
    id: string;
    role: string;
    content: string;
  };
};

const ClassFolder = (props: PropsType) => {
  return (
    <Link to={`/chat/${props.className}`}>
      <div>{props.className}</div>
    </Link>
  );
};

export default ClassFolder;
