import { useContext, useState } from "react";
import "./Comments.scss";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import moment from "moment";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useTranslation } from "react-i18next";
import Loading from "../loading/Loading.jsx";

const Comments = ({ postId }) => {
  const [descr, setDescr] = useState("");
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation("global");

  const { isPending, error, data } = useQuery({
    queryKey: ["comments"],
    queryFn: () =>
      makeRequest.get("/comments?postId=" + postId).then((res) => {
        return res.data;
      }),
  });

  const mutation = useMutation({
    mutationFn: (newComment) => {
      return makeRequest.post("/comments", newComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  }); //мутация, за да може динамично да се създават коментари

  const deleteMutation = useMutation({
    mutationFn: (commentId) => {
      return makeRequest.delete("/comments/" + commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    mutation.mutate({ descr, postId });
    setDescr("");
  };

  return (
    <div className="comments">
      <div className="write">
        <input
          type="text"
          placeholder={t("forum.comPla")}
          value={descr}
          onChange={(e) => setDescr(e.target.value)}
        />
        <button onClick={handleClick}>{t("send")}</button>
      </div>
      {error ? (
        t("error")
      ) : isPending ? (
        <Loading />
      ) : (
        data.map((comment) => (
          <div className="comment" key={comment.id}>
            <div className="info">
              <span>{comment.username}</span>
              <p>{comment.descr}</p>
            </div>
            <span className="date">
              {moment(comment.created_date).fromNow()}
            </span>
            <div style={{ display: "flex", gap: "1em" }}>
              <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
              {menuOpen &&
                (currentUser.is_parent ||
                  comment.comment_userId === currentUser.id) && (
                  <div>
                    <button onClick={() => deleteMutation.mutate(comment.id)}>
                      {t("remove")}
                    </button>
                  </div>
                )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Comments;
