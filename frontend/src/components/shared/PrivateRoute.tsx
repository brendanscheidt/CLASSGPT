import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingIndicator from "../LoadingIndicator";

interface PrivateRouteProps {
  children?: React.ReactNode; // Using the optional operator (?) in case children might be undefined
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.isLoading && !auth?.user) {
      navigate("/login");
    }
  }, [auth?.isLoading, auth?.user, navigate]);

  if (auth?.isLoading) {
    return <LoadingIndicator />;
  }

  return auth?.user ? <>{children}</> : null;
};

export default PrivateRoute;
