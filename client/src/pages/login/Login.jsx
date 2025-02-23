import "../register/Register.scss";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation("global");
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const [err, setErr] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await login(inputs);
        navigate("/");
      } catch (err) {
        setErr(err.response.data);
      }
    }
  };

  const handleChange = (e) => {
    setErr(null);
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  //проверява дали въведените данни са валидни
  const validateForm = () => {
    let newErrors = "";

    if (inputs.password.length === 0) {
      newErrors = t("dataValidation.noPw");
    }
    if (inputs.email.trim() === "") {
      newErrors = t("dataValidation.noEmail");
    }
    setErr(newErrors);

    if (newErrors.length > 0) {
      return false;
    }

    return true;
  };

  const { login } = useContext(AuthContext);

  return (
    <div className="register">
      {" "}
      <form className="login">
        <h2>{t("login.login")}</h2>
        <label>{t("login.email")}</label>
        <input type="email" onChange={handleChange} name="email" required />
        <label>{t("login.password")}</label>
        <input
          type="password"
          onChange={handleChange}
          name="password"
          required
        />
        {err}
        <button type="submit" onClick={handleLogin}>
          {t("login.login")}
        </button>
        <span>{t("login.noAccount")}</span>
        <Link to="/register">
          <button>{t("login.register")}</button>
        </Link>
      </form>
    </div>
  );
};

export default Login;
