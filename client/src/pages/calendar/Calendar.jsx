import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { Box } from "@mui/material";
import { makeRequest } from "../../axios";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext.js";
import Checkbox from "@mui/material/Checkbox";
import Loading from "../../components/loading/Loading.jsx";
import { debounce } from "lodash";
import "./Calendar.scss";

const Calendar = () => {
  const { t, i18n } = useTranslation("global");
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [currentEvents, setCurrentEvents] = useState([]);
  const [menu, setMenu] = useState(false);
  const [delMenu, setDelMenu] = useState(false);
  const [delID, setDelID] = useState(0);
  const [users, setUsers] = useState([]);
  const [chosen, setChosen] = useState({ start: "", end: "", title: "" });
  const calendarRef = useRef(null);

  const { isPending, error } = useQuery({
    queryKey: ["todos"],
    queryFn: () =>
      makeRequest.get("/todos/calendar").then((res) => {
        const result = [...new Set(res.data.map((item) => item.todo_userId))];
        setUsers(
          result.map((el) => {
            const user = res.data.find((item) => item.todo_userId === el);

            return {
              id: user.todo_userId,
              name: user.username,
              color: user.user_color,
              checked: true,
            };
          })
        );
        setCurrentEvents(
          res.data
            .filter((event) => event.start_date !== null && !event.is_fam_task)
            .map((event) => ({
              id: event.id,
              title: event.task,
              start: event.start_date,
              end: event.end_date,
              color: event.is_group_task
                ? "#b9f1e9"
                : event.user_color
                ? event.user_color
                : "#c0f8aa",
              //ако не е възложен час, заданието става целодневно
              allDay: event.start_date.includes(":00:00.000Z"),
              user: event.todo_userId,
              editable:
                event.todo_userId === currentUser.id &&
                event.task_status === "unfinished",
              textColor: "#000",
            }))
        );
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

  const handleDateClick = (selected) => {
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();
    setChosen({ start: selected.startStr, end: selected.endStr });
    setMenu(true);
    setDelMenu(false);
  };

  const handleTextInput = (is_group) => {
    const title = chosen.title;
    if (title) {
      const task = title;
      const start_date = chosen.start;
      const end_date = chosen.end;
      const is_fam_task = false;
      const is_group_task = is_group;
      mutation.mutate({
        task,
        start_date,
        end_date,
        is_fam_task,
        is_group_task,
      });
      setChosen({
        start: "",
        end: "",
        title: "",
      });
      setMenu(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (event) => {
      const start_date = moment(event.startStr).format("YYYY-MM-DD HH:mm:ss");
      const end_date = event.endStr
        ? moment(event.endStr).format("YYYY-MM-DD HH:mm:ss")
        : null;
      return makeRequest.put("/todos/calendar/" + event.id, {
        start_date,
        end_date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleEventChange = useRef(
    debounce((info) => {
      setMenu(false);
      setDelMenu(false);
      const { event } = info;
      updateMutation.mutate(event);
    }, 300) //така че да не се зарежда всеки път, когато user мести event
  ).current;

  const deleteMutation = useMutation({
    mutationFn: (taskId) => {
      return makeRequest.delete("/todos/" + taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleEventClick = (selected) => {
    if (selected.event.durationEditable) {
      setMenu(false);
      setDelMenu(true);
      setDelID(selected.event.id);
    }
  };

  const handleDeletion = () => {
    deleteMutation.mutate(delID);
    setDelMenu(false);
    setDelID(0);
  };

  const handleCheckboxChange = (userId) => {
    setMenu(false);
    setDelMenu(false);
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, checked: !user.checked } : user
      )
    );
  };

  //създава календара наново, но според предпочитанията на потребителя
  useEffect(() => {
    if (calendarRef.current) {
      const filteredEvents = currentEvents.filter((event) =>
        users.find((user) => user.id === event.user && user.checked)
      );
      calendarRef.current.getApi().removeAllEvents();
      calendarRef.current.getApi().addEventSource(filteredEvents);
    }
  }, [users, currentEvents]);

  return (
    <Box sx={{ margin: { xs: "0px", sm: "1.5em" } }}>
      <Box
        display="flex"
        justifyContent="space-between"
        sx={{ flexDirection: { xs: "column", sm: "row" } }}
      >
        <Box
          sx={{
            width: { xs: "100vw", sm: "25vw" },
            height: {
              xs: "100%",
              sm: "90vh",
            },
          }}
          margin="auto"
          backgroundColor="#FFFCC7"
          p="15px"
          borderRadius="4px"
        >
          {error ? (
            t("error")
          ) : isPending ? (
            <Loading />
          ) : currentUser.is_parent ? (
            <div>
              {" "}
              <h1 style={{ textAlign: "center" }}>{t("calendar.famMems")}</h1>
              <br />
              {users.map((user) => (
                <div key={user.id}>
                  <Checkbox
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={user.checked}
                    className="myInput"
                    style={{
                      color: user.color,
                    }}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                  <label htmlFor={`user-${user.id}`}>
                    {user.name}{" "}
                    {user.id === currentUser.id && t("calendar.you")}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <></>
          )}
          {menu ? (
            <div className="conDiv">
              {" "}
              <label>{t("calendar.addEvent")}</label>
              <br />
              <input
                type="text"
                name="task"
                maxLength="100"
                value={chosen.title}
                onChange={(e) => {
                  setChosen((prevChosen) => ({
                    ...prevChosen,
                    title: e.target.value,
                  }));
                }}
                id="calInput"
                placeholder={t("askInput")}
                style={{ width: "24em" }}
              />
              <br />
              <button onClick={() => handleTextInput(false)}>
                {t("calendar.createEvent")}
              </button>
              {currentUser.is_parent ? (
                <button onClick={() => handleTextInput(true)}>
                  {t("todo.addGroupTask")}
                </button>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}
          {delMenu ? (
            <div className="conDiv">
              <h1>{t("calendar.sure")}</h1>
              <button onClick={() => handleDeletion()}>
                {t("calendar.conDelete")}
              </button>
            </div>
          ) : (
            <></>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: "white",
            padding: "2em",
            borderRadius: "0.5em",
            width: { xs: "100vw", sm: "70vw" },
            height: { sm: "90vh" },
          }}
          margin="auto"
        >
          {isPending ? (
            <Loading />
          ) : (
            <FullCalendar
              height="85vh"
              width="100vw"
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
              ]}
              //когато е на по-малък екран, бутони се съкращават
              buttonText={
                window.innerWidth < 768
                  ? {
                      today: t("calendar.sToday"),
                      day: t("calendar.sDay"),
                      week: t("calendar.sWeek"),
                      month: t("calendar.sMonth"),
                      list: t("calendar.sList"),
                    }
                  : {
                      today: t("calendar.today"),
                      day: t("calendar.day"),
                      week: t("calendar.week"),
                      month: t("calendar.month"),
                      list: t("calendar.list"),
                    }
              }
              headerToolbar={
                window.innerWidth < 768
                  ? {
                      left: "prev,next",
                      center: "title",
                      right: "dayGridMonth,timeGridDay,listMonth",
                    }
                  : {
                      left: "prev,next,today",
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
                    }
              }
              longPressDelay="0"
              ref={calendarRef}
              allDayText={t("calendar.allDay")}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              locale={i18n.language || "en"}
              select={handleDateClick}
              eventClick={(info) => {
                handleEventClick(info);
              }}
              events={currentEvents}
              eventResizable={true}
              eventChange={handleEventChange}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
