import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/shared/PrivateRoute";
import ClassChat from "./pages/ClassChat";
import ClassCreate from "./pages/ClassCreate";

function App() {
  return (
    <main>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/createClass"
          element={
            <PrivateRoute>
              <ClassCreate />
            </PrivateRoute>
          }
        />
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
    </main>
  );
}

export default App;
