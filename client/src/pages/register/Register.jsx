import "./Register.scss";
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";

const Register = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation("global");
  //цветовите опции
  const colorOptions = [
    "#99e6cc",
    "#FACA78",
    "#f5b6a3",
    "#F9E5DA",
    "#EFA5A6",
    "#B2E4E1",
    "#EE9B69",
    "#ddb3d7",
    "#d4e09b",
    "#ffcb69",
  ];
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    is_parent: true,
    family_name: "",
    family_secret_code: "",
    confirm_password: "",
    user_color: colorOptions[0],
  });
  const [err, setErr] = useState(null);

  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault();
    //при невалидни данни, програмата въобще не стига до бакенда
    if (validateForm()) {
      try {
        await axios.post("http://localhost:8800/api/auth/register", inputs);
        await login(inputs);
        navigate("/");
      } catch (err) {
        setErr(err.response.data);
      }
    }
  };
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setErr(null);
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    let newErrors = "";

    if (inputs.confirm_password !== inputs.password) {
      newErrors = t("dataValidation.noMatchPw");
    }
    if (inputs.password.length < 6) {
      newErrors = t("dataValidation.shortPw");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputs.email)) {
      newErrors = t("dataValidation.invalidEmail");
    }
    if (inputs.email.trim() === "") {
      newErrors = t("dataValidation.noEmail");
    }
    if (inputs.username.trim() === "") {
      newErrors = t("dataValidation.noName");
    }
    if (
      inputs.family_secret_code.trim() === "" &&
      inputs.family_name.trim() === ""
    ) {
      newErrors = t("dataValidation.noFam");
    }

    setErr(newErrors);

    if (newErrors.length > 0) {
      return false;
    }

    return true;
  };

  return (
    <div className="register">
      <form className="registration-form">
        <h2>{t("login.register")}</h2>
        {menuOpen ? (
          <>
            <label>{t("login.famName")}</label>
            <input
              type="text"
              name="family_name"
              maxLength="50"
              required
              onChange={handleChange}
            />
          </>
        ) : (
          <>
            <label>{t("login.famKey")}</label>
            <input
              type="text"
              name="family_secret_code"
              required
              onChange={handleChange}
            />
            <label>{t("login.parent")}</label> 
            <ToggleButtonGroup
              value={inputs.is_parent.toString()}
              exclusive
              onChange={(e) => {
                setInputs((prevInputs) => ({
                  ...prevInputs,
                  is_parent: e.target.value === "true",
                }));
              }}
              aria-label="Are you a parent?"
              style={{ display: "flex" }}
            >
              <ToggleButton
                value="true"
                name="is_parent"
                title={t("login.vipUser")}
                style={{
                  border:
                    inputs.is_parent.toString() === "true"
                      ? "0.3em solid #59322B"
                      : "0.3em solid #EF9A48",
                  backgroundColor: "#EF9A48",
                }}
              >
                <StarIcon style={{ color: "#FFFCC7", fontSize: "2em" }} />
              </ToggleButton>
              <ToggleButton
                value="false"
                name="is_parent"
                title={t("login.regUser")}
                style={{
                  border:
                    inputs.is_parent.toString() === "false"
                      ? "0.3em solid #59322B"
                      : "0.3em solid #EF9A48",
                  backgroundColor: "#EF9A48",
                }}
              >
                <FavoriteIcon style={{ color: "#D54751", fontSize: "2em" }} />
              </ToggleButton>
            </ToggleButtonGroup>
          </>
        )}
        <br />
        <button
          onClick={() => {
            setMenuOpen(!menuOpen);
          }}
        >
          {t("login.noFam")}
        </button>
        <label>{t("login.email")}</label>
        <input
          type="email"
          name="email"
          maxLength="70"
          onChange={handleChange}
        />
        <label>{t("login.name")}</label>
        <input
          type="text"
          name="username"
          maxLength="45"
          onChange={handleChange}
        />
        <label>{t("login.password")}</label>
        <input
          type="password"
          name="password"
          maxLength="50"
          onChange={handleChange}
        />
        <label>{t("login.conPassword")}</label>
        <input
          type="password"
          name="confirm_password"
          maxLength="50"
          onChange={handleChange}
        />
        <label>{t("login.color")}</label>
        <ToggleButtonGroup
          value={inputs.user_color}
          exclusive
          onChange={handleChange}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
          aria-label="color-picker"
        >
          {colorOptions.map((color) => (
            <ToggleButton
              key={color}
              value={color}
              name="user_color"
              style={{
                backgroundColor: color,
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                margin: "5px",
                border:
                  inputs.user_color === color
                    ? "2px solid #59322B"
                    : `2px solid ${color}`,
              }}
            />
          ))}
        </ToggleButtonGroup>
        <br />
        <p>{err}</p>
        <br />
        <button type="submit" onClick={handleClick}>
          {t("login.register")}
        </button>
        <span>{t("login.account")}</span>
        <Link to="/login">
          <button>{t("login.login")}</button>
        </Link>
      </form>
      <br />
    </div>
  );
};

export default Register;
