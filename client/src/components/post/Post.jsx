import "./Post.scss";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import Comments from "../comments/Comments";
import moment from "moment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";
import "moment/locale/bg";
//позволява превеждането на момент на български език

const Post = ({ post, isSelected, toggleComments }) => {
  const { t, i18n } = useTranslation("global");
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const { currentUser } = useContext(AuthContext);
  moment.locale(i18n.language);

  const deleteMutation = useMutation({
    mutationFn: (post) => {
      return makeRequest.delete("/posts/" + post.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <div className="post" style={{ backgroundColor: post.user_color }}>
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.username}</span>
              </Link>
              <span className="date">
                {moment(post.created_date).fromNow()}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1em" }}>
            <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
            {(currentUser.is_parent || post.userId === currentUser.id) &&
              menuOpen && (
                <div style={{}}>
                  <button
                    onClick={() => {
                      deleteMutation.mutate(post);
                    }}
                  >
                    {t("remove")}
                  </button>
                </div>
              )}
          </div>
        </div>
        <div
          className="content"
          style={{
            backgroundColor: post.user_color,
            padding: "1em",
            borderRadius: "0.8em",
          }}
        >
          <p>{post.descr}</p>
          {post.img && (
            <img
              src={"./upload/" + post.img}
              alt={t("forum.imgErr")}
              style={{ width: "30%", height: "auto" }}
            />
          )}
          <div className="item" onClick={toggleComments}>
            <br />
            <br />
            {isSelected ? t("forum.hideCom") : t("forum.seeCom")}
          </div>
        </div>
        {isSelected && <Comments postId={post.id} />}
      </div>
    </div>
  );
};

export default Post;
