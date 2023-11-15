type PropsType = {
  className: string;
  classChats: {
    id: string;
    role: string;
    content: string;
  };
};

const ClassFolder = (props: PropsType) => {
  return <div>{props.className}</div>;
};

export default ClassFolder;
