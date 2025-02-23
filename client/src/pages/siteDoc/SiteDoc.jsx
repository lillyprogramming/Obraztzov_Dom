import "./SiteDoc.scss";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LangSwitch from "../../components/langSwitch/LangSwitch.jsx";

const SiteDoc = () => {
  const { t } = useTranslation("global");
  const navigate = useNavigate();
  const infoCards = [
    {
      title: "forum",
      descr: t("siteDoc.appForumAd"),
      imgSrc: "./upload/forum.png",
      imgAlt: "Хора, които разговарят",
    },
    {
      title: "calendar",
      descr: t("siteDoc.appCalendarAd"),
      imgSrc: "./upload/calendar.png",
      imgAlt: "Човек, който подрежда събития в календар",
    },
    {
      title: "grocery",
      descr: t("siteDoc.appGroceryAd"),
      imgSrc: "./upload/grocery.png",
      imgAlt: "Човек, който пазарува",
    },
  ];

  return (
    <div className="start-up-page">
      <nav>
        <div className="navbar-container">
          <div className="site-name">
            <span>
              {" "}
              <img
                src="./upload/logo.png"
                alt="дом лого"
                width="30px"
                style={{ marginRight: "1em" }}
              />
              Образцов Дом
            </span>
          </div>
          <div style={{ display: "flex" }}>
            <LangSwitch />
            <button
              className="sign-in-button"
              onClick={() => navigate("/login")}
              // style={{ marginLeft: "5em" }}
            >
              {t("login.login")}
            </button>
          </div>
        </div>
      </nav>
      <div className="headerDiv">
        <header>
          <h1>Образцов Дом</h1>
          <h3>{t("siteDoc.appMotto")} </h3>
        </header>
        <img src="./upload/house.svg" alt="happy house, happy life" />
      </div>
      <div className="content">
        <div className="main-content">
          <p>{t("siteDoc.appDescr")}</p>
        </div>
        <div className="infoContent">
          <h2>{t("siteDoc.possibilities")}</h2>
          <div className="optionCards">
            {infoCards.map((card) => {
              return (
                <div className="cards" key={card.title}>
                  <img src={card.imgSrc} alt={card.imgAlt} width="100%" />
                  <p>{card.descr}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="logInDiv">
          <p>{t("siteDoc.appSignIn")}</p>
          <button onClick={() => navigate("/login")}>{t("login.login")}</button>
        </div>
      </div>
      <footer>
        <p>&copy; 2024 Образцов Дом {t("siteDoc.appRights")}</p>
      </footer>
    </div>
  );
};

export default SiteDoc;
