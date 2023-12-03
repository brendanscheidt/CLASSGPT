import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  checkAuthStatus,
  getUserClasses,
  loginUser,
  logoutUser,
  signupUser,
} from "../helpers/api-communicator";

type User = {
  name: string;
  email: string;
};

type UserClasses = {
  name: string;
  model: {
    name: string;
    instructions: string;
    tools: { type: string }[];
    model: string;
  };
  pages: {
    name: string;
    pageInstructions: string;
    chats: {
      id: string;
      role: string;
      content: string;
    }[];
  }[];
}[];

type UserAuth = {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  classes: UserClasses;
  updateClasses: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<UserAuth | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    //fetch if user's cookies are valid then skip login
    async function checkStatus() {
      try {
        setIsLoading(true);
        const data = await checkAuthStatus();

        if (data) {
          await updateClasses();
          setUser({ email: data.email, name: data.name });
          console.log(user);
          setIsLoggedIn(true);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      updateClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const updateClasses = async () => {
    if (!isLoggedIn) return; // Only fetch classes if the user is logged in

    try {
      console.log("fetching classes...");
      const data = await getUserClasses();
      setClasses(data.classes);
      console.log(classes);
    } catch (err) {
      console.log(err);
      setClasses([]);
    } finally {
      console.log("fetching completed.");
    }
  };

  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password);

    if (data) {
      setUser({ email: data.email, name: data.name });

      await updateClasses();
      setIsLoggedIn(true);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const data = await signupUser(name, email, password);

    if (data) {
      setUser({ email: data.email, name: data.name });
      setIsLoggedIn(true);
      updateClasses();
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setIsLoggedIn(false);
      setUser(null);
      setClasses([]);
    } catch (err) {
      console.log(err);
    }
  };

  const value = {
    user,
    isLoggedIn,
    login,
    logout,
    signup,
    isLoading,
    classes,
    updateClasses,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
