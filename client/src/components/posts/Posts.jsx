import Post from "../post/Post";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Loading from "../loading/Loading.jsx";

const Posts = () => {
  const { t } = useTranslation("global");
  const [selectedPostId, setSelectedPostId] = useState(null);

  const { isPending, error, data } = useQuery({
    queryKey: ["posts"],
    queryFn: () =>
      makeRequest.get("/posts").then((res) => {
        return res.data;
      }),
  });

  //ако jwt не е валиден, препраща потребителя към логин
  if (error) {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      window.location.href = "/login";
    }
  }

  const toggleComments = (postId) => {
    setSelectedPostId((prevId) => (prevId === postId ? null : postId));
  };

  return (
    <div className="posts">
      {error ? (
        t("error")
      ) : isPending ? (
        <Loading />
      ) : (
        data.map((post) => (
          <Post
            post={post}
            key={post.id}
            isSelected={selectedPostId === post.id}
            toggleComments={() => toggleComments(post.id)}
          />
        ))
      )}
    </div>
  );
};

export default Posts;
