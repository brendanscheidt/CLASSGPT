import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/shared/PrivateRoute";
import ClassChat from "./pages/ClassChat";
import { useEffect, useLayoutEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import LoadingIndicator from "./components/LoadingIndicator";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();

  useLayoutEffect(() => {
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      if (!auth?.isClassesLoading && !auth?.isLoading) {
        setIsLoading(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [auth?.isClassesLoading, auth?.isLoading]);

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [isLoading]);

  return (
    <main>
      {/* Loading indicator */}
      {isLoading && (
        <div className="Loading">
          <LoadingIndicator />
        </div>
      )}
      <div className={`main-content ${isLoading ? "hidden" : ""}`}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/chat/:classname/:pagename"
            element={
              <PrivateRoute>
                <ClassChat />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </main>
  );
}

export default App;
