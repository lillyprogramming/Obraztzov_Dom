import "./Navbar.scss";
import LogoutIcon from "@mui/icons-material/Logout";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import LangSwitch from "../langSwitch/LangSwitch.jsx";

const Navbar = (props) => {
  const { t } = useTranslation("global");
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const navItems = ["forum", "grocery", "todo", "calendar"];
  if (currentUser.is_parent) {
    navItems[navItems.length] = "householdControl";
  }

  const navigate = useNavigate();

  const [err, setErr] = useState(null);
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerWidth = 240;

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  //в случай, че приложението се на телефон
  const drawer = (
    <div
      onClick={handleDrawerToggle}
      sx={{ textAlign: "center" }}
      className="drawerDiv"
    >
      <Link to={"/"} style={{ textDecoration: "none" }}>
        <h3
          style={{
            marginTop: "1em",
            textAlign: "center",
            color: "black",
          }}
        >
          {" "}
          <img
            src="./upload/logo.png"
            alt="дом лого"
            width="10%"
            style={{ marginRight: "1em" }}
          />
          Образцов Дом
        </h3>
      </Link>
      <hr />
      <ul>
        {navItems.map((item) => (
          <li key={item} style={{ marginLeft: "1em" }}>
            <Link to={`/${item}`} style={{ textDecoration: "none" }}>
              <span>{t(`navbar.${item}`)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(
          "http://localhost:8800/api/auth/logout",
          {},
          { withCredentials: true }
        )
        .then(() => {
          localStorage.clear();
          navigate("/login");
        });
    } catch (err) {
      setErr(err.response.data);
    }
  };

  return (
    <Box className="NavPage">
      <CssBaseline />
      <AppBar component="nav" sx={{ backgroundColor: "#79C39E" }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              display: { xs: "none", sm: "block" },
              width: "25%",
            }}
          >
            <Link to="/" style={{ textDecoration: "none", color: "white" }}>
              <img
                src="./upload/logo.png"
                alt="дом лого"
                width="10%"
                style={{ marginRight: "1em" }}
              />
              Образцов Дом
            </Link>
          </Typography>
          <Box
            width="100%"
            sx={{
              justifyContent: "space-evenly",
              flexDirection: "row",
              display: { xs: "none", sm: "flex" },
            }}
          >
            {/* Какво се вижда на компютър */}
            {navItems.map((item) => (
              <div
                key={item}
                style={{
                  flex: 1,
                  textAlign: "center",
                  borderRadius: "0.5em",
                  //страницата, на която се намира се очертава
                  backgroundColor:
                    location.pathname === `/${item}` && "#4a9f8d",
                }}
                className="navItems"
              >
                <Link
                  key={item}
                  to={`/${item}`}
                  style={{
                    textDecoration: "none",
                    color: "#fff",
                    textTransform: "uppercase",
                    display: "block",
                    padding: "1em",
                    fontSize: "0.8em",
                  }}
                >
                  <span>{t(`navbar.${item}`)}</span>
                </Link>
              </div>
            ))}
          </Box>
          <Box
            sx={{
              display: { xs: "flex" },
              justifyContent: { xs: "flex-end", sm: "space-around" },
              gap: { xs: "2em" },
              width: { xs: "100%", sm: "25%" },
            }}
          >
            {/* <div className="langSwitch">
              <button
                onClick={() => {
                  changeLanguage("en");
                }}
                style={{ borderRadius: "0.5em 0em 0em 0.5em" }}
              >
                EN
              </button>
              <button
                onClick={() => {
                  changeLanguage("bg");
                }}
                style={{ borderRadius: "0em 0.5em 0.5em 0em" }}
              >
                BG
              </button>
            </div> */}
            <LangSwitch />
            <div className="right">
              <LogoutIcon onClick={handleClick} />
            </div>

            {err}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <br />
      <br />
    </Box>
  );
};
export default Navbar;
