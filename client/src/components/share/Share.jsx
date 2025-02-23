import "./Share.scss";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useTranslation } from "react-i18next";

const Share = () => {
  const { t } = useTranslation("global");
  const [file, setFile] = useState("");
  const [descr, setDescr] = useState("");

  const { currentUser } = useContext(AuthContext);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPost) => {
      return makeRequest.post("/posts", newPost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    //проверява дали данните са въведени
    if (descr.trim() !== "" || file) {
      let imgUrl = "";
      if (file) imgUrl = await upload();
      mutation.mutate({ descr, img: imgUrl });
      setDescr("");
      setFile(null);
    }
  };
  return (
    <div
      className="share"
      style={{ backgroundColor: currentUser.user_color, textAlign: "center" }}
    >
      <div className="container">
        <div className="top">
          <div className="left">
            <input
              type="text"
              placeholder={`${t("forum.opin")}, ${currentUser.username} ?`}
              onChange={(e) => setDescr(e.target.value)}
              value={descr}
            />
          </div>
          <div className="right">
            {file && (
              <img
                className="file"
                style={{ maxWidth: "255px", height: "auto" }}
                alt=""
                src={URL.createObjectURL(file)}
              />
            )}
          </div>
        </div>
        <br />
        <br />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file">
              <div className="item">
                <span>{t("forum.addImg")}</span>
              </div>
            </label>
          </div>
          <div className="right">
            <button onClick={handleClick}>{t("forum.share")}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
