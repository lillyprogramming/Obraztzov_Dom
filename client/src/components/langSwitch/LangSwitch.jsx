import "./LangSwitch.scss";
import { useEffect } from "react";
import i18n from "..//translations/i18n.js";

const LangSwitch = () => {
  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  }; //за промяната на езика

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  }, []);

  return (
    <div className="langSwitch">
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
    </div>
  );
};

export default LangSwitch;
