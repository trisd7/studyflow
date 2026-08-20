import { useEffect, useState } from "react";
const API_URL = "https://studyflow-yvob.onrender.com";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  // =========================================================
  // TASKS
  // =========================================================

  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskSubject, setTaskSubject] = useState("Web Development");
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState("");

  const subjects = [
    "Web Development",
    "Database Systems",
    "Data Structures",
    "Computer Networks",
    "General",
  ];

  // Load tasks from backend
  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      setTaskError("");

      const response = await fetch(`${API_URL}/api/tasks`);

      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
      setTaskError("Could not connect to the StudyFlow server.");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Add task
  const addTask = async () => {
    if (!taskTitle.trim()) {
      setTaskError("Please enter a task name.");
      return;
    }

    try {
      setTaskError("");

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: taskTitle.trim(),
          subject: taskSubject,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const newTask = await response.json();

      setTasks((currentTasks) => [...currentTasks, newTask]);
      setTaskTitle("");
    } catch (error) {
      console.error(error);
      setTaskError("Could not add the task.");
    }
  };

  // Complete / uncomplete task
  const toggleTask = async (task) => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !Boolean(task.completed),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === updatedTask.id ? updatedTask : item
        )
      );
    } catch (error) {
      console.error(error);
      setTaskError("Could not update the task.");
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      );
    } catch (error) {
      console.error(error);
      setTaskError("Could not delete the task.");
    }
  };

  // =========================================================
  // FOCUS TIMER
  // =========================================================

  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((seconds) => {
        if (seconds <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          setTimerCompleted(true);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const startTimer = () => {
    setTimerCompleted(false);
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerCompleted(false);
    setTimerSeconds(25 * 60);
  };

  // =========================================================
  // DASHBOARD
  // =========================================================

  const completedTasks = tasks.filter((task) => Boolean(task.completed));
  const pendingTasks = tasks.filter((task) => !Boolean(task.completed));

  const completionPercentage =
    tasks.length === 0
      ? 0
      : Math.round((completedTasks.length / tasks.length) * 100);

  const renderDashboard = () => {
    return (
      <section className="dashboard">
        <div className="welcome-card">
          <div>
            <span className="eyebrow">YOUR STUDY SPACE</span>

            <h3>Stay focused. Keep progressing.</h3>

            <p>
              Organize your subjects, complete your tasks, and build
              consistent study habits.
            </p>

            <button
              className="primary-button"
              onClick={() => setActivePage("Focus Timer")}
            >
              Start studying →
            </button>
          </div>

          <div className="welcome-illustration">📚</div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Total tasks</span>
            <strong>{tasks.length}</strong>
            <small>{pendingTasks.length} remaining</small>
          </div>

          <div className="stat-card">
            <span>Completed</span>
            <strong>{completedTasks.length}</strong>
            <small>Keep going!</small>
          </div>

          <div className="stat-card">
            <span>Focus session</span>
            <strong>25m</strong>
            <small>Pomodoro timer</small>
          </div>

          <div className="stat-card">
            <span>Overall progress</span>
            <strong>{completionPercentage}%</strong>
            <small>Based on tasks</small>
          </div>
        </div>

        <div className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow dark">TODAY</span>
                <h3>Study tasks</h3>
              </div>

              <button
                className="text-button"
                onClick={() => setActivePage("Tasks")}
              >
                View all
              </button>
            </div>

            <div className="task-list">
              {tasks.length === 0 ? (
                <div className="dashboard-empty">
                  <span>✓</span>
                  <p>No tasks yet.</p>
                </div>
              ) : (
                tasks.slice(0, 4).map((task) => (
                  <div
                    className={`task ${
                      task.completed ? "task-completed" : ""
                    }`}
                    key={task.id}
                  >
                    <button
                      className="task-check"
                      onClick={() => toggleTask(task)}
                    >
                      {task.completed ? "✓" : ""}
                    </button>

                    <div>
                      <strong>{task.title}</strong>
                      <span>{task.subject}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel progress-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow dark">PROGRESS</span>
                <h3>Your progress</h3>
              </div>
            </div>

            <div className="progress-summary">
              <div className="progress-circle">
                <span>{completionPercentage}%</span>
              </div>

              <p>
                {completedTasks.length} of {tasks.length} tasks completed
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // =========================================================
  // TASKS PAGE
  // =========================================================

  const renderTasks = () => {
    return (
      <section className="page tasks-page">
        <div className="page-heading">
          <span className="eyebrow dark">STAY ORGANIZED</span>

          <h1>My Tasks</h1>

          <p>Create and manage your study tasks.</p>
        </div>

        <div className="task-form-card">
          <div className="form-field task-title-field">
            <label>Task name</label>

            <input
              type="text"
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addTask();
                }
              }}
              placeholder="What do you need to study?"
            />
          </div>

          <div className="form-field">
            <label>Subject</label>

            <select
              value={taskSubject}
              onChange={(event) => setTaskSubject(event.target.value)}
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <button className="add-task-button" onClick={addTask}>
            + Add task
          </button>
        </div>

        {taskError && <div className="error-message">{taskError}</div>}

        <div className="tasks-card">
          <div className="tasks-card-header">
            <div>
              <span className="eyebrow dark">YOUR TASKS</span>

              <h2>
                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              </h2>
            </div>

            <span className="task-count">
              {completedTasks.length} completed
            </span>
          </div>

          {loadingTasks ? (
            <div className="tasks-empty">
              <div className="empty-icon">◌</div>
              <h3>Loading tasks...</h3>
            </div>
          ) : tasks.length === 0 ? (
            <div className="tasks-empty">
              <div className="empty-icon">✓</div>

              <h3>No tasks yet</h3>

              <p>Add your first study task above.</p>
            </div>
          ) : (
            <div className="real-task-list">
              {tasks.map((task) => (
                <div
                  className={`real-task ${
                    task.completed ? "completed-task" : ""
                  }`}
                  key={task.id}
                >
                  <button
                    className={`real-task-check ${
                      task.completed ? "checked" : ""
                    }`}
                    onClick={() => toggleTask(task)}
                    aria-label="Complete task"
                  >
                    {task.completed ? "✓" : ""}
                  </button>

                  <div className="real-task-info">
                    <strong>{task.title}</strong>
                    <span>{task.subject}</span>
                  </div>

                  <span
                    className={`task-status ${
                      task.completed ? "completed" : "pending"
                    }`}
                  >
                    {task.completed ? "Completed" : "In progress"}
                  </span>

                  <button
                    className="delete-task"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Delete task"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  // =========================================================
  // FOCUS TIMER PAGE
  // =========================================================

  const renderFocusTimer = () => {
    const progress = ((25 * 60 - timerSeconds) / (25 * 60)) * 100;

    return (
      <section className="page">
        <div className="timer-page">
          <div className="timer-header">
            <span className="eyebrow dark">STUDYFLOW</span>

            <h1>Focus Timer</h1>

            <p>
              Stay focused for 25 minutes, then take a short break.
            </p>
          </div>

          <div className="timer-card">
            <div className="timer-mode">
              {timerCompleted
                ? "SESSION COMPLETE"
                : timerRunning
                ? "FOCUS SESSION"
                : "READY TO FOCUS"}
            </div>

            <div
              className={`timer-display ${
                timerCompleted ? "timer-finished" : ""
              }`}
            >
              {timerCompleted ? "Done!" : formatTime(timerSeconds)}
            </div>

            <div className="timer-progress">
              <div
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="timer-controls">
              {!timerRunning && !timerCompleted && (
                <button
                  className="timer-main-button"
                  onClick={startTimer}
                >
                  ▶ Start
                </button>
              )}

              {timerRunning && (
                <button
                  className="timer-main-button"
                  onClick={pauseTimer}
                >
                  ❚❚ Pause
                </button>
              )}

              {timerCompleted && (
                <button
                  className="timer-main-button"
                  onClick={resetTimer}
                >
                  ↻ New session
                </button>
              )}

              {!timerCompleted && (
                <button
                  className="timer-reset-button"
                  onClick={resetTimer}
                >
                  Reset
                </button>
              )}
            </div>

            {timerCompleted && (
              <div className="timer-success">
                🎉 Great work! You completed a focused study session.
              </div>
            )}
          </div>

          <div className="timer-tips">
            <div>
              <strong>25 min</strong>
              <span>Focus</span>
            </div>

            <div>
              <strong>5 min</strong>
              <span>Short break</span>
            </div>

            <div>
              <strong>4</strong>
              <span>Sessions</span>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // =========================================================
  // SUBJECTS / PROGRESS
  // =========================================================

  const renderOtherPage = () => {
    const pageInfo = {
      Subjects: {
        icon: "▦",
        title: "Subjects",
        description:
          "Organize your study subjects and track your progress.",
      },

      Progress: {
        icon: "◔",
        title: "Progress",
        description:
          "Track your learning progress and study habits.",
      },
    };

    const info = pageInfo[activePage];

    return (
      <section className="page">
        <div className="coming-soon">
          <div className="coming-icon">{info.icon}</div>

          <span className="eyebrow dark">STUDYFLOW</span>

          <h1>{info.title}</h1>

          <p>{info.description}</p>

          {activePage === "Subjects" && (
            <button
              className="primary-button dark-button"
              onClick={() => setActivePage("Tasks")}
            >
              Go to tasks →
            </button>
          )}

          {activePage === "Progress" && (
            <div className="simple-progress-card">
              <strong>{completionPercentage}%</strong>
              <span>Task completion</span>

              <div className="progress-bar">
                <div
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>

              <p>
                {completedTasks.length} completed out of {tasks.length} tasks
              </p>
            </div>
          )}
        </div>
      </section>
    );
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigation = [
    {
      name: "Dashboard",
      icon: "⌂",
    },
    {
      name: "Subjects",
      icon: "▦",
    },
    {
      name: "Tasks",
      icon: "✓",
    },
    {
      name: "Focus Timer",
      icon: "◷",
    },
    {
      name: "Progress",
      icon: "◔",
    },
  ];

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="app">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-icon">S</div>

            <div className="brand-text">
              <h2>StudyFlow</h2>
              <span>Study smarter</span>
            </div>
          </div>

          <nav className="navigation">
            {navigation.map((item) => (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => setActivePage(item.name)}
              >
                <span className="nav-icon">{item.icon}</span>

                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-profile">
          <div className="avatar">S</div>

          <div>
            <strong>Student</strong>
            <span>Keep going!</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="greeting">Good afternoon, Student! 👋</p>

            <h2>{activePage}</h2>
          </div>

          <button className="profile-button">S</button>
        </header>

        {activePage === "Dashboard" && renderDashboard()}

        {activePage === "Tasks" && renderTasks()}

        {activePage === "Focus Timer" && renderFocusTimer()}

        {(activePage === "Subjects" || activePage === "Progress") &&
          renderOtherPage()}
      </main>
    </div>
  );
}

export default App;