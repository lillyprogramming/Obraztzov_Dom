import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loading/Loading.jsx";
import "./Grocery.scss";

const Grocery = () => {
  const { t } = useTranslation("global");
  const [toBuy, setToBuy] = useState("");
  const queryClient = useQueryClient();

  const { isPending, error, data } = useQuery({
    queryKey: ["grocery"],
    queryFn: () =>
      makeRequest.get("/grocery").then((res) => {
        return res.data;
      }),
  });

  if (error) {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      window.location.href = "/login";
    }
  }

  const mutation = useMutation({
    mutationFn: (toBuy) => {
      return makeRequest.post("/grocery", toBuy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery"] });
    },
  });

  const handleAddItem = (e) => {
    e.preventDefault();
    if (toBuy.trim() !== "") {
      mutation.mutate({ toBuy });
      setToBuy("");
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (toBuyId) => {
      return makeRequest.delete("/grocery/" + toBuyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery"] });
    },
  });

  return (
    <div className="grocery-app">
      <h1>{t("navbar.grocery")}</h1>
      <br />
      <div
        className="
      groceries"
      >
        <ul>
          {error ? (
            t("error")
          ) : isPending ? (
            <Loading />
          ) : (
            data.map((toBuy) => (
              <li key={toBuy.id}>
                {toBuy.to_buy}
                <button
                  onClick={() => {
                    deleteMutation.mutate(toBuy.id);
                  }}
                >
                  {t("remove")}
                </button>
              </li>
            ))
          )}
        </ul>
        <br />
        <div className="add-grocery">
          <input
            type="text"
            value={toBuy}
            onChange={(e) => setToBuy(e.target.value)}
            maxLength="100"
            placeholder={t("askInput")}
          />
          <button onClick={handleAddItem}>{t("add")}</button>
        </div>
        <br />
      </div>
    </div>
  );
};

export default Grocery;
