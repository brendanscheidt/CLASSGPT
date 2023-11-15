import { Link } from "react-router-dom";

type PropsType = {
  className: string;
  pageName: string;
};

const NotePage = (props: PropsType) => {
  return (
    <div style={{ paddingLeft: "20px" }}>
      <Link to={`/chat/${props.className}/${props.pageName}`}>
        {props.pageName}
      </Link>
    </div>
  );
};

export default NotePage;
