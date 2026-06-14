// script.js
// This file handles the frontend logic for Taskify
// It talks to the backend API to get, add, update, and delete tasks

var API_URL = '/api/tasks';

var form = document.getElementById('task-form');
var taskIdInput = document.getElementById('task-id');
var titleInput = document.getElementById('title');
var descriptionInput = document.getElementById('description');
var dueDateInput = document.getElementById('due_date');
var statusInput = document.getElementById('status');
var titleError = document.getElementById('title-error');
var tasksList = document.getElementById('tasks-list');
var emptyMsg = document.getElementById('empty-msg');
var formTitle = document.getElementById('form-title');
var submitBtn = document.getElementById('submit-btn');
var cancelBtn = document.getElementById('cancel-btn');

// load tasks when the page first opens
document.addEventListener('DOMContentLoaded', loadTasks);

// handle form submit (works for both adding and editing)
form.addEventListener('submit', function (e) {
  e.preventDefault();

  // basic validation - title can't be empty
  if (titleInput.value.trim() === '') {
    titleError.textContent = 'Please enter a title for this task.';
    titleInput.focus();
    return;
  } else {
    titleError.textContent = '';
  }

  var taskData = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    due_date: dueDateInput.value,
    status: statusInput.value
  };

  var id = taskIdInput.value;

  if (id) {
    // we are editing an existing task
    updateTask(id, taskData);
  } else {
    // we are adding a new task
    addTask(taskData);
  }
});

// clear the error message as soon as the user starts typing
titleInput.addEventListener('input', function () {
  titleError.textContent = '';
});

// cancel editing and reset the form
cancelBtn.addEventListener('click', function () {
  resetForm();
});

// fetch all tasks from the server and display them
function loadTasks() {
  fetch(API_URL)
    .then(function (res) {
      return res.json();
    })
    .then(function (tasks) {
      renderTasks(tasks);
    })
    .catch(function (err) {
      console.error('Error loading tasks:', err);
    });
}

// send a new task to the server
function addTask(taskData) {
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  })
    .then(function (res) {
      return res.json();
    })
    .then(function () {
      resetForm();
      loadTasks();
    })
    .catch(function (err) {
      console.error('Error adding task:', err);
    });
}

// update an existing task
function updateTask(id, taskData) {
  fetch(API_URL + '/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  })
    .then(function (res) {
      return res.json();
    })
    .then(function () {
      resetForm();
      loadTasks();
    })
    .catch(function (err) {
      console.error('Error updating task:', err);
    });
}

// delete a task
function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  fetch(API_URL + '/' + id, {
    method: 'DELETE'
  })
    .then(function (res) {
      return res.json();
    })
    .then(function () {
      loadTasks();
    })
    .catch(function (err) {
      console.error('Error deleting task:', err);
    });
}

// fill the form with a task's data so the user can edit it
function editTask(task) {
  taskIdInput.value = task.id;
  titleInput.value = task.title;
  descriptionInput.value = task.description || '';
  dueDateInput.value = task.due_date || '';
  statusInput.value = task.status;

  formTitle.textContent = 'Edit Task';
  submitBtn.textContent = 'Update Task';
  cancelBtn.classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// reset the form back to "add new task" mode
function resetForm() {
  form.reset();
  taskIdInput.value = '';
  formTitle.textContent = 'Add a new task';
  submitBtn.textContent = 'Add Task';
  cancelBtn.classList.add('hidden');
  titleError.textContent = '';
}

// render the list of tasks on the page
function renderTasks(tasks) {
  tasksList.innerHTML = '';

  if (tasks.length === 0) {
    tasksList.appendChild(emptyMsg);
    return;
  }

  tasks.forEach(function (task) {
    var card = document.createElement('div');
    card.className = 'task-card status-' + task.status;

    var info = document.createElement('div');
    info.className = 'task-info';

    var title = document.createElement('h3');
    title.textContent = task.title;
    info.appendChild(title);

    if (task.description) {
      var desc = document.createElement('p');
      desc.textContent = task.description;
      info.appendChild(desc);
    }

    var meta = document.createElement('div');
    meta.className = 'task-meta';

    var statusBadge = document.createElement('span');
    statusBadge.className = 'status-badge status-' + task.status;
    statusBadge.textContent = task.status.replace('-', ' ');
    meta.appendChild(statusBadge);

    if (task.due_date) {
      var due = document.createElement('span');
      due.className = 'due-date';
      due.textContent = task.due_date;
      meta.appendChild(due);
    }

    info.appendChild(meta);

    var actions = document.createElement('div');
    actions.className = 'task-actions';

    var editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', function () {
      editTask(task);
    });

    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function () {
      deleteTask(task.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(info);
    card.appendChild(actions);

    tasksList.appendChild(card);
  });
}
