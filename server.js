// server.js
// This is the main backend file for Taskify
// It sets up the server, connects to the "database" (a JSON file), and handles all task routes

var express = require('express');
var cors = require('cors');
var fs = require('fs');
var path = require('path');

var app = express();
var PORT = 3004;

var DB_FILE = path.join(__dirname, 'tasks.json');

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// make sure the database file exists, if not create it with an empty array
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// helper function to read all tasks from the database file
function readTasks() {
  var data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

// helper function to save tasks back to the database file
function writeTasks(tasks) {
  fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
}

// GET all tasks
app.get('/api/tasks', function (req, res) {
  var tasks = readTasks();
  // show newest tasks first
  tasks.sort(function (a, b) {
    return b.id - a.id;
  });
  res.json(tasks);
});

// GET a single task by id
app.get('/api/tasks/:id', function (req, res) {
  var tasks = readTasks();
  var id = parseInt(req.params.id);
  var task = tasks.find(function (t) {
    return t.id === id;
  });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// POST create a new task
app.post('/api/tasks', function (req, res) {
  var title = req.body.title;
  var description = req.body.description;
  var status = req.body.status;
  var due_date = req.body.due_date;

  // validation - title is required
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (!status) {
    status = 'pending';
  }

  var tasks = readTasks();

  // figure out the next id
  var nextId = 1;
  if (tasks.length > 0) {
    nextId = Math.max.apply(null, tasks.map(function (t) { return t.id; })) + 1;
  }

  var newTask = {
    id: nextId,
    title: title.trim(),
    description: description || '',
    status: status,
    due_date: due_date || '',
    created_at: new Date().toISOString()
  };

  tasks.push(newTask);
  writeTasks(tasks);

  res.status(201).json(newTask);
});

// PUT update an existing task
app.put('/api/tasks/:id', function (req, res) {
  var id = parseInt(req.params.id);
  var title = req.body.title;
  var description = req.body.description;
  var status = req.body.status;
  var due_date = req.body.due_date;

  // validation - title is required
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  var tasks = readTasks();
  var taskIndex = tasks.findIndex(function (t) {
    return t.id === id;
  });

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks[taskIndex].title = title.trim();
  tasks[taskIndex].description = description || '';
  tasks[taskIndex].status = status || tasks[taskIndex].status;
  tasks[taskIndex].due_date = due_date || '';

  writeTasks(tasks);

  res.json(tasks[taskIndex]);
});

// DELETE a task
app.delete('/api/tasks/:id', function (req, res) {
  var id = parseInt(req.params.id);
  var tasks = readTasks();
  var taskIndex = tasks.findIndex(function (t) {
    return t.id === id;
  });

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  writeTasks(tasks);

  res.json({ message: 'Task deleted successfully' });
});

app.listen(PORT, function () {
  console.log('Taskify server running on http://localhost:' + PORT);
});
