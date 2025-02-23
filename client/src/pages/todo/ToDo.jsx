import "./ToDo.scss";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loading/Loading.jsx";

const Todo = () => {
  const { t } = useTranslation("global");
  const [err, setErr] = useState(null);
  const queryClient = useQueryClient();
  const { currentUser } = useContext(AuthContext);
  const [inputs, setInputs] = useState({
    task: "",
    selectedStartDate: "",
    selectedStartTime: "",
    selectedEndDate: "",
    selectedEndTime: "",
  });

  const { isPending, error, data } = useQuery({
    queryKey: ["todos"],
    queryFn: () =>
      makeRequest.get("/todos").then((res) => {
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
    mutationFn: (newTodo) => {
      return makeRequest.post("/todos", newTodo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleAddTask = (e, is_fam_task, is_group_task = false) => {
    e.preventDefault();
    if (validateForm()) {
      const task = inputs.task;
      //форматира датата по начин, по който SQL я приема
      const start_date = inputs.selectedStartDate
        ? `${inputs.selectedStartDate} ${inputs.selectedStartTime}`
        : new Date().toJSON().split("T")[0];
      const end_date = inputs.selectedEndDate
        ? `${inputs.selectedEndDate} ${inputs.selectedEndTime}`
        : start_date;
      setInputs((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([key, value]) => [key, ""])
        )
      );
      mutation.mutate({
        task,
        start_date,
        end_date,
        is_fam_task,
        is_group_task,
      });
    }
  };

  const updateMutation = useMutation({
    mutationFn: (taskId) => {
      return makeRequest.put("/todos/" + taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId) => {
      return makeRequest.delete("/todos/" + taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const validateForm = () => {
    let newErrors = "";

    if (
      `${inputs.selectedStartDate} ${inputs.selectedStartTime}` >
        `${inputs.selectedEndDate} ${inputs.selectedEndTime}` &&
      `${inputs.selectedEndDate} ${inputs.selectedEndTime}`.trim() !== ""
    ) {
      newErrors = t("dataValidation.wrongDate");
    }
    if (inputs.task.length < 1) {
      newErrors = t("dataValidation.noInput");
    }

    setErr(newErrors);

    if (newErrors.length > 0) {
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="todo-app">
      <div className="taskList">
        <h1>{t("navbar.todo")}</h1>
        <div className="tasks">
          <ul>
            {error ? (
              t("error")
            ) : isPending ? (
              <Loading />
            ) : (
              data
                .filter((task) => !task.is_fam_task)
                .map((task) => (
                  <li
                    key={task.id}
                    style={{
                      backgroundColor: task.is_group_task
                        ? "#fcc997"
                        : task.task_status === "taken"
                        ? "#f7f4c4"
                        : "#fae7d4",
                    }}
                  >
                    {task.task}
                    {task.task_status === "taken" ? (
                      <button
                        onClick={() => {
                          updateMutation.mutate(task.id);
                        }}
                      >
                        {t("completed")}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          deleteMutation.mutate(task.id);
                        }}
                      >
                        {t("done1")}
                      </button>
                    )}
                  </li>
                ))
            )}
          </ul>
        </div>
        <div className="family-tasks">
          <br />
          <h1>{t("todo.takeOne")}</h1>
          <br />
          <ul>
            {error ? (
              t("error")
            ) : isPending ? (
              <Loading />
            ) : (
              data
                .filter((task) => task.is_fam_task)
                .map((task) => (
                  <li key={task.id}>
                    {task.task}
                    <button
                      onClick={() => {
                        updateMutation.mutate(task.id);
                      }}
                    >
                      {t("todo.takeTask")}
                    </button>
                  </li>
                ))
            )}
          </ul>
        </div>
      </div>
      <div className="add-task">
        <h1>{t("todo.taskMenu")}</h1>
        <br />
        <div>
          <label>{t("todo.addTask")} </label>
          <input
            type="text"
            name="task"
            maxLength="100"
            value={inputs.task}
            onChange={handleChange}
            placeholder={t("askInput")}
            style={{ width: "24em" }}
          />
        </div>

        <div className="startIn">
          <label>{t("todo.startDate")}</label>
          <input
            type="date"
            name="selectedStartDate"
            value={inputs.selectedStartDate}
            onChange={handleChange}
          />

          <label>{t("todo.startTime")}</label>
          <input
            type="time"
            name="selectedStartTime"
            value={inputs.selectedStartTime}
            onChange={handleChange}
          />
        </div>
        <div className="endIn">
          <label>{t("todo.endDate")}</label>
          <input
            type="date"
            name="selectedEndDate"
            value={inputs.selectedEndDate}
            onChange={handleChange}
          />

          <label>{t("todo.endTime")}</label>
          <input
            type="time"
            name="selectedEndTime"
            value={inputs.selectedEndTime}
            onChange={handleChange}
          />
        </div>
        <br />
        {err}
        <button
          title={t("todo.indTaskHoverTitle")}
          onClick={(e) => handleAddTask(e, false)}
        >
          {t("todo.addTask")}
        </button>
        <br />
        {currentUser.is_parent ? (
          <div className="parentTodoOptions">
            <button
              title={t("todo.teamTaskHoverTitle")}
              onClick={(e) => handleAddTask(e, true)}
            >
              {t("todo.addTeamTask")}
            </button>
            <br />
            <button
              title={t("todo.groupTaskHoverTitle")}
              onClick={(e) => handleAddTask(e, false, true)}
            >
              {t("todo.addGroupTask")}
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Todo;
