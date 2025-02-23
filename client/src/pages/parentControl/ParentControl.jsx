import "./ParentControl.scss";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext.js";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useQuery } from "@tanstack/react-query";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/loading/Loading.jsx";

const ParentControl = () => {
  const { t } = useTranslation("global");
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [memData, setMemData] = useState(null);
  const [doneTasks, setDoneTasks] = useState(null);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const { data, isPending, error } = useQuery({
    queryKey: ["family"],
    queryFn: () =>
      makeRequest.get("/family").then((res) => {
        return res.data;
      }),
  });

  useQuery({
    queryKey: ["family_mem"],
    queryFn: () =>
      makeRequest.get("/family/members").then((res) => {
        setMemData(res.data);
        return res.data;
      }),
  });

  useQuery({
    queryKey: ["todos"],
    queryFn: () =>
      makeRequest.get("/todos/star").then((res) => {
        setDoneTasks(res.data);
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

  const updateMutation = useMutation({
    mutationFn: ({ id, username }) => {
      return makeRequest.put(`/family/${id}`, {
        username: username,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family_mem"] });
    },
  });

  const handleInput = (e, memberId, field) => {
    const updatedData = memData.map((member) =>
      member.id === memberId
        ? { ...member, [field]: e.target.innerText }
        : member
    );
    setMemData(updatedData);
    setErr("");
  };

  const giveStardom = useMutation({
    mutationFn: (id) => {
      return makeRequest.put(`/family/stardom/${id}`);
    },
    onSuccess: () => {
      handleClick();
      queryClient.invalidateQueries({ queryKey: ["family_mem"] });
    },
  });

  //при предаване на админ права, потребителя бива изхвърлен от приложението
  const handleClick = async () => {
    try {
      await axios
        .post(
          "http://localhost:8800/api/auth/logout",
          {},
          { withCredentials: true }
        )
        .then(() => {
          localStorage.clear();
          navigate("/login");
        });
    } catch (err) {
      setErr(err.response.data);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (memId) => {
      return makeRequest.delete("/family/" + memId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family_mem"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => {
      return makeRequest.delete("/todos/" + taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  //имената на колоните в двете таблици
  const tableHeaders = (
    <thead>
      <tr>
        <th>{t("parentControl.username")}</th>
        <th>{t("parentControl.email")}</th>
        <th>{t("parentControl.role")}</th>
        <th>{t("parentControl.functions")}</th>
      </tr>
    </thead>
  );

  const taskTableHeaders = (
    <thead>
      <tr>
        <th>{t("parentControl.username")}</th>
        <th>{t("parentControl.taskName")}</th>
        <th>{t("parentControl.taskStatus")}</th>
      </tr>
    </thead>
  );

  return (
    <div className="parent-con">
      <br />
      <h1>
        {error ? (
          error.response.data
        ) : isPending ? (
          <Loading />
        ) : (
          <div className="famInfo">
            {t("parentControl.yourFamName")}
            <b style={{ color: "#4DA394" }}>{data[0].family_name}</b>
            {t("parentControl.yourCode")}
            <div>
              <b style={{ color: "#4DA394" }}>{data[0].family_secret_code} </b>

              <button
                className="copyButton"
                onClick={() =>
                  navigator.clipboard.writeText(data[0].family_secret_code)
                }
              >
                <ContentCopyIcon className="icon" />
              </button>
            </div>
          </div>
        )}
        <span style={{ color: "red", margin: "auto" }}>{err}</span>
        <br />
        {isPending ? (
          <Loading />
        ) : (
          memData && (
            <div style={{ overflowX: "auto" }}>
              <table>
                {tableHeaders}
                <tbody>
                  {memData.map((member) => (
                    <tr
                      key={member.id}
                      style={{ backgroundColor: member.user_color }}
                    >
                      <td>
                        <div
                          contentEditable="true"
                          defaultValue={member.username}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => {
                            handleInput(e, member.id, "username");
                          }}
                        >
                          {member.username}
                        </div>
                      </td>
                      <td>
                        <div className="emailDiv">{member.email}</div>
                      </td>
                      <td>
                        {member.is_parent ? (
                          <Tooltip title={t("login.vipUser")}>
                            <StarIcon
                              style={{ color: "#FFFCC7", fontSize: "1.3em" }}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title={t("login.regUser")}>
                            <FavoriteIcon
                              style={{ color: "#D54751", fontSize: "1.3em" }}
                            />
                          </Tooltip>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            const id = member.id;
                            const username = member.username;
                            if (username.trim() === "") {
                              setErr(t("dataValidation.noName"));
                            } else {
                              updateMutation.mutate({ id, username });
                            }
                          }}
                        >
                          {t("edit")}
                        </button>
                        {currentUser.id !== member.id && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(t("parentControl.confirmDel"))
                              ) {
                                deleteMutation.mutate(member.id);
                              }
                            }}
                          >
                            {t("parentControl.delMem")}
                          </button>
                        )}
                        {!member.is_parent && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(t("parentControl.confirmSwap"))
                              ) {
                                giveStardom.mutate(member.id);
                              }
                            }}
                          >
                            {t("parentControl.giveStar")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
        <br />
        {isPending ? (
          <Loading />
        ) : (
          doneTasks && (
            <div style={{ overflowX: "auto" }}>
              <table>
                {taskTableHeaders}
                <tbody>
                  {doneTasks.map((task) => (
                    <tr
                      key={task.id}
                      style={{ backgroundColor: task.user_color }}
                    >
                      <td>{task.username}</td>
                      <td>{task.task}</td>
                      <td>
                        {task.task_status === "done" ? (
                          <button
                            style={{ width: "100%", margin: "auto" }}
                            onClick={() => {
                              deleteTaskMutation.mutate(task.id);
                            }}
                          >
                            {t("parentControl.isDone")}
                          </button>
                        ) : (
                          <p
                            style={{
                              textAlign: "center",
                              fontSize: "0.7em",
                              color: "rgb(170, 30, 40)",
                              textTransform: "uppercase",
                            }}
                          >
                            {t("parentControl.isNotDone")}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </h1>
      <br />
    </div>
  );
};

export default ParentControl;
