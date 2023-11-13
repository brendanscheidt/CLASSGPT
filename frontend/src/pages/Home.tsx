import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const auth = useAuth();

  return <div>Home</div>;
};

export default Home;
