import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Logo from "./shared/Logo";
import { useAuth } from "../context/AuthContext";
import NavigationLink from "./shared/NavigationLink";

const Header = () => {
  const auth = useAuth();

  return (
    <AppBar
      sx={{ bgcolor: "transparent", position: "static", boxShadow: "none" }}
    >
      <Toolbar sx={{ display: "flex" }}>
        <Logo />
        <div>
          {auth?.isLoggedIn ? (
            auth.classes.length ? (
              auth.classes[0].pages.length ? (
                <>
                  <NavigationLink
                    bg="#00fffc"
                    to={`/chat/${auth.classes[0].name}/${auth.classes[0].pages[0].name}`}
                    text="Go To Chats"
                    textColor="black"
                  />
                  <NavigationLink
                    bg="#51538f"
                    textColor="white"
                    to="/"
                    text="Logout"
                    onClick={auth.logout}
                  />
                </>
              ) : (
                <>
                  <NavigationLink
                    bg="#00fffc"
                    to={`/chat/${auth.classes[0].name}/default`}
                    text="Go To Chats"
                    textColor="black"
                  />
                  <NavigationLink
                    bg="#51538f"
                    textColor="white"
                    to="/"
                    text="Logout"
                    onClick={auth.logout}
                  />
                </>
              )
            ) : (
              <>
                <NavigationLink
                  bg="#00fffc"
                  to="/chat/default/default"
                  text="Go To Chats"
                  textColor="black"
                />
                <NavigationLink
                  bg="#51538f"
                  textColor="white"
                  to="/"
                  text="Logout"
                  onClick={auth.logout}
                />
              </>
            )
          ) : (
            <>
              <NavigationLink
                bg="#00fffc"
                to="/login"
                text="Login"
                textColor="black"
              />
              <NavigationLink
                bg="#51538f"
                textColor="white"
                to="/signup"
                text="Signup"
              />
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
