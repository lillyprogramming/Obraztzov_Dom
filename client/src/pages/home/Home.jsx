import "./Home.scss";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const { t } = useTranslation("global");
  const homePages = [
    {
      title: "forum",
      imgSrc: "./upload/forumHome.svg",
      imgAlt: "Хора, които разговарят",
    },
    {
      title: "grocery",
      imgSrc: "./upload/shopping.svg",
      imgAlt: "Хора с покупки",
    },
    {
      title: "todo",
      imgSrc: "./upload/todoHome.svg",
      imgAlt: "Човек, който стой пред списък със задачи",
    },
    {
      title: "calendar",
      imgSrc: "./upload/calendarHome.svg",
      imgAlt: "Човек, който подрежда събития на календар",
    },
  ];
  if (currentUser.is_parent) {
    homePages.push({
      title: "householdControl",
      imgSrc: "./upload/admin.svg",
      imgAlt: "Администратор",
    });
  }
  return (
    <div className="home">
      {homePages.map((page) => {
        return (
          <div key={page.title} className="homeCard">
            <Link to={`/${page.title}`} className="link">
              <img src={page.imgSrc} alt={page.imgAlt} />
              <h2>{t(`navbar.${page.title}`)}</h2>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Home;
