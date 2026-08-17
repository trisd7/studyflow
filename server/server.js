const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = new Database("studyflow.db");

// Create tasks table
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "StudyFlow API is running!" });
});

// Get all tasks
app.get("/api/tasks", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks").all();
  res.json(tasks);
});

// Add a task
app.post("/api/tasks", (req, res) => {
  const { title, subject } = req.body;

  if (!title || !subject) {
    return res.status(400).json({
      message: "Title and subject are required"
    });
  }

  const result = db
    .prepare("INSERT INTO tasks (title, subject) VALUES (?, ?)")
    .run(title, subject);

  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(task);
});

// Mark task complete/incomplete
app.put("/api/tasks/:id", (req, res) => {
  const { completed } = req.body;

  db.prepare(
    "UPDATE tasks SET completed = ? WHERE id = ?"
  ).run(completed ? 1 : 0, req.params.id);

  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(req.params.id);

  res.json(task);
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);

  res.json({ message: "Task deleted" });
});

app.listen(PORT, () => {
  console.log(`StudyFlow API running on http://localhost:${PORT}`);
});

