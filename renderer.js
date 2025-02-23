// Helper: Convert "HH:MM" to decimal hours
function timeStringToDecimal(timeStr) {
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
}

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const getTodayDate = () => new Date().toISOString().split('T')[0];

function showFunFact() {
  const funFacts = [
    "Did you know? A task completed is like a mini celebration! 🎉",
    "Fun Fact: Each completed task boosts your productivity superpowers! 🚀",
    "Keep going! Even small steps are progress! 🌟",
    "Remember: Your dedication makes every task magical! ✨",
    "Pro tip: Smile more and code more! 😄"
  ];
  const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
  const funFactEl = document.getElementById('fun-fact');
  if (funFactEl) {
    funFactEl.textContent = fact;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Load tasks from localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
  function updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  const taskForm = document.getElementById('task-form');
  const taskList = document.getElementById('task-list');
  const taskSelect = document.getElementById('task-select'); // now input field
  const todayCommentEl = document.getElementById('today-commented-time');
  const balanceEl = document.getElementById('balance-time');
  const datalist = document.getElementById('task-options');

  // Update form sections based on task existence
  const toggleFormSections = () => {
    const name = taskSelect.value.trim();
    const exists = tasks.some(t => t.name === name);
    const newTaskDetails = document.getElementById('new-task-details');
    const existingTaskDetails = document.getElementById('existing-task-details');
    
    // Update selectors to include textarea elements
    const newFields = newTaskDetails.querySelectorAll('input, select, textarea');
    const existingFields = existingTaskDetails.querySelectorAll('input, select, textarea');
    
    if (exists) {
      newTaskDetails.style.display = 'none';
      existingTaskDetails.style.display = 'block';
      newFields.forEach(el => {
        el.disabled = true;
        el.removeAttribute('required');
      });
      existingFields.forEach(el => {
        el.disabled = false;
        el.setAttribute('required', '');
      });
    } else {
      newTaskDetails.style.display = 'block';
      existingTaskDetails.style.display = 'none';
      newFields.forEach(el => {
        el.disabled = false;
        el.setAttribute('required', '');
      });
      existingFields.forEach(el => {
        el.disabled = true;
        el.removeAttribute('required');
      });
    }
  };

  // Listen to input changes on taskSelect to toggle form sections
  taskSelect.addEventListener('input', toggleFormSections);

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskName = taskSelect.value.trim();
    if (!taskName) {
      alert("Please enter a task name.");
      return;
    }
    const existingTask = tasks.find(t => t.name === taskName);
    if (!existingTask) {
      // New Task: store task name in uppercase
      const idInput = document.getElementById('task-id').value.trim();
      const desc = document.getElementById('task-desc').value;
      const startDate = document.getElementById('start-date').value;
      const estimation = document.getElementById('estimation').value;
      const status = document.getElementById('status').value;
      if (!timeRegex.test(estimation)) {
        alert("Please enter a valid Estimation (HH:MM).");
        return;
      }
      const newTask = {
        id: idInput,
        name: taskName.toUpperCase(), // modified to uppercase
        desc: desc,
        startDate: startDate,
        estimation: estimation,
        status: status,
        comments: []
      };
      tasks.push(newTask);
      updateLocalStorage();
      // Refresh task list to remove the empty state message
      updateTaskList();
      taskForm.reset();
    } else {
      // Existing Task: update comment info
      const spent = document.getElementById('spent-hours').value;
      const extra = document.getElementById('extra-comment').value;
      if (!timeRegex.test(spent)) {
        alert("Please enter valid spent hours in HH:MM format.");
        return;
      }
      existingTask.comments.push({ text: extra, date: new Date().toISOString().split('T')[0], hours: spent });
      updateLocalStorage();
      if (document.getElementById('page-task-details').innerHTML) {
        showTaskDetails(existingTask);
      }
      taskForm.reset();
    }
    // Reset visibility after submission
    toggleFormSections();
    updateTodayCommentedTime();
    showToast('Task updated successfully! 🎯');
    if (existingTask && existingTask.status === 'Completed') {
      celebrateCompletion();
    }
  });

  // Updated addTaskToList with new card styling for Task Overview
  function addTaskToList(task) {
    const taskItem = document.createElement('div');
    taskItem.classList.add('card', 'mb-3', 'shadow-sm', 'task-overview');
    taskItem.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${getStatusEmoji(task.status)} ${task.name.toUpperCase()}</h5>
        <p class="card-text">${task.desc}</p>
        <p class="card-text"><small class="text-muted">${task.startDate} | ${task.estimation}</small></p>
      </div>
    `;
    taskItem.addEventListener('click', () => showTaskDetails(task));
    taskList.appendChild(taskItem);
  }

  function showTaskDetails(task) {
    let detailsContainer = document.getElementById('page-task-details');
    detailsContainer.innerHTML = `
      <!-- Details view -->
      <div>
        <p><strong>ID:</strong> ${task.id}</p>
        <p><strong>Name:</strong> ${task.name}</p>
        <p><strong>Description:</strong> ${task.desc}</p>
        <p><strong>Start Date:</strong> ${task.startDate}</p>
        <p><strong>Estimation:</strong> ${task.estimation} hours</p>
        <p><strong>Status:</strong> ${task.status}</p>
        <button id="edit-task-btn" class="btn btn-warning btn-icon" title="Edit Task"><i class="fas fa-edit"></i></button>
        <button id="delete-task-btn" class="btn btn-danger btn-icon" title="Delete Task"><i class="fas fa-trash"></i></button>
        <hr/>
        <h5>Comments</h5>
        <ul id="comments-list" class="list-group">
          ${task.comments.map((comment, index) => `
            <li class="list-group-item">
              ${comment.text} <em>(Date: ${comment.date}, Hours: ${comment.hours})</em>
              <button class="btn btn-sm btn-warning btn-icon float-right edit-comment-btn" data-index="${index}" title="Edit Comment"><i class="fas fa-edit"></i></button>
              <button class="btn btn-sm btn-danger btn-icon float-right delete-comment-btn" data-index="${index}" title="Delete Comment"><i class="fas fa-trash"></i></button>
            </li>`).join('')}
        </ul>
        <form id="comment-form" class="mt-3">
          <input type="hidden" id="edit-index" value="">
          <div class="form-group">
            <textarea class="form-control" id="comment-text" placeholder="Your comment" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <input type="date" class="form-control" id="comment-date" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          <div class="form-group">
            <input type="text" class="form-control" id="comment-hours" placeholder="HH:MM" required>
          </div>
          <button type="submit" class="btn btn-primary">Submit Comment</button>
        </form>
      </div>`;

    document.getElementById('edit-task-btn').addEventListener('click', () => editTask(task));
    document.getElementById('delete-task-btn').addEventListener('click', () => deleteTask(task)); // Delete Task Event Listener
    document.querySelectorAll('.edit-comment-btn').forEach(button => {
      button.addEventListener('click', (e) =>
        editComment(task, e.target.getAttribute('data-index'))
      );
    });
    document.querySelectorAll('.delete-comment-btn').forEach(button => {
      button.addEventListener('click', (e) =>
        deleteComment(task, e.target.getAttribute('data-index'), task)
      );
    });

    document.getElementById('comment-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const commentText = document.getElementById('comment-text').value;
      const commentDate = document.getElementById('comment-date').value;
      const commentHours = document.getElementById('comment-hours').value;
      if (!timeRegex.test(commentHours)) {
        alert("Please enter comment hours in HH:MM format.");
        return;
      }
      const editIndex = document.getElementById('edit-index').value;
      if (editIndex !== "") {
        task.comments[parseInt(editIndex)] = { text: commentText, date: commentDate, hours: commentHours };
      } else {
        task.comments.push({ text: commentText, date: commentDate, hours: commentHours });
      }
      updateLocalStorage();
      showTaskDetails(task);
      updateTodayCommentedTime();
    });

    // Attach live update on the comment-hours field to update remaining time as you type
    const commentHoursInput = document.getElementById('comment-hours');
    commentHoursInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (timeRegex.test(val)) {
        const additional = timeStringToDecimal(val);
        let currentTotal = 0;
        tasks.forEach(t => {
          t.comments.forEach(comment => {
            if (comment.date === getTodayDate() && timeRegex.test(comment.hours)) {
              currentTotal += timeStringToDecimal(comment.hours);
            }
          });
        });
        const newBalance = (8 - (currentTotal + additional)).toFixed(2);
        balanceEl.textContent = `Balance time to add: ${newBalance} hours`;
      } else {
        updateTodayCommentedTime();
      }
    });
  }

  const editTask = (task) => {
    let detailsContainer = document.getElementById('page-task-details');
    detailsContainer.innerHTML = `
      <!-- Edit view -->
      <form id="edit-task-form">
        <div class="form-group">
          <label for="edit-task-name">Task Name</label>
          <input type="text" class="form-control" id="edit-task-name" value="${task.name}" required>
        </div>
        <div class="form-group">
          <label for="edit-task-desc">Description</label>
          <input type="text" class="form-control" id="edit-task-desc" value="${task.desc}" required>
        </div>
        <div class="form-group">
          <label for="edit-start-date">Start Date</label>
          <input type="date" class="form-control" id="edit-start-date" value="${task.startDate}" required>
        </div>
        <div class="form-group">
          <label for="edit-estimation">Estimation (HH:MM)</label>
          <input type="text" class="form-control" id="edit-estimation" value="${task.estimation}" placeholder="HH:MM" required>
        </div>
        <div class="form-group">
          <label for="edit-status">Status</label>
          <select class="form-control" id="edit-status">
            <!-- Updated status options -->
            <option value="Yet-to-start" ${task.status === 'Yet-to-start' ? 'selected' : ''}>Yet-to-start</option>
            <option value="In-Progress" ${task.status === 'In-Progress' ? 'selected' : ''}>In-Progress</option>
            <option value="Hold" ${task.status === 'Hold' ? 'selected' : ''}>Hold</option>
            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Closed" ${task.status === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Save Changes</button>
        <button id="cancel-edit-btn" class="btn btn-secondary ml-2">Cancel</button>
      </form>`;

    document.getElementById('edit-task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const newEstimation = document.getElementById('edit-estimation').value;
      if (!timeRegex.test(newEstimation)) {
        alert("Please enter a valid Estimation time in HH:MM format.");
        return;
      }
      // Convert edited task name to uppercase
      const editedTaskName = document.getElementById('edit-task-name').value.toUpperCase(); // modified to uppercase
      const editedTaskDesc = document.getElementById('edit-task-desc').value;
      const editedStartDate = document.getElementById('edit-start-date').value;
      const editedEstimation = newEstimation;
      const editedStatus = document.getElementById('edit-status').value;

      // Update the task details in the tasks array
      const taskIndex = tasks.findIndex(t => t.id === task.id); // Assuming task.id is unique
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...task,
          name: editedTaskName,
          desc: editedTaskDesc,
          startDate: editedStartDate,
          estimation: editedEstimation,
          status: editedStatus
        };
        updateLocalStorage();
        showTaskDetails(tasks[taskIndex]); // Show updated details
        updateTaskList(); // Refresh the task list
      }
    });
    document.getElementById('cancel-edit-btn').addEventListener('click', (e) => {
      e.preventDefault();
      showTaskDetails(task);
    });
  };

  const deleteTask = (task) => {
    if (confirm(`Are you sure you want to delete task "${task.name}"?`)) {
      tasks = tasks.filter(t => t.id !== task.id);
      updateLocalStorage();
      document.getElementById('page-task-details').innerHTML = ''; // Clear details view
      updateTaskList();
    }
  };

  const deleteComment = (index, task) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      task.comments.splice(index, 1);
      updateLocalStorage();
      showTaskDetails(task);
      updateTodayCommentedTime();
    }
  };

  function editComment(task, index) {
    const comment = task.comments[index];
    document.getElementById('comment-text').value = comment.text;
    document.getElementById('comment-date').value = comment.date;
    document.getElementById('comment-hours').value = comment.hours;
    document.getElementById('edit-index').value = index;
  }

  // Updated updateTaskList to render new card style and empty state message
  function updateTaskList() {
    taskList.innerHTML = '';
    if (tasks.length === 0) {
      taskList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-tasks"></i>
          <h5>No tasks yet!</h5>
          <p>Add your first task to get started 🚀</p>
        </div>
      `;
      return;
    }
    
    tasks.forEach(task => {
      const taskItem = document.createElement('div');
      taskItem.classList.add('card', 'mb-3', 'shadow-sm', 'task-overview');
      taskItem.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${getStatusEmoji(task.status)} ${task.name.toUpperCase()}</h5>
          <p class="card-text">${task.desc}</p>
          <p class="card-text"><small class="text-muted">${task.startDate} | ${task.estimation}</small></p>
        </div>
      `;
      taskItem.addEventListener('click', () => showTaskDetails(task));
      taskList.appendChild(taskItem);
    });
    // Refresh datalist options to reflect any task name changes
    datalist.innerHTML = '';
    tasks.forEach(task => {
      const option = document.createElement('option');
      option.value = task.name;
      datalist.appendChild(option);
    });
  }

  document.getElementById('start-date').value = getTodayDate();

  function updateTodayCommentedTime() {
    let totalHours = 0;
    tasks.forEach(task => {
      task.comments.forEach(comment => {
        if (comment.date === getTodayDate() && timeRegex.test(comment.hours)) {
          totalHours += timeStringToDecimal(comment.hours);
        }
      });
    });
    const balanceHours = 8 - totalHours;
    todayCommentEl.textContent = `Today's commented time: ${totalHours.toFixed(2)} hours`;
    balanceEl.textContent = `Balance time to add: ${balanceHours.toFixed(2)} hours`;
  }

  updateTodayCommentedTime();
  updateTaskList(); // <-- Added to ensure empty message displays on load

  // NEW: Sync home page with external changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'tasks') {
      tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      updateTaskList();
      updateTodayCommentedTime();
    }
  });

  const formatTime = (input) => {
    let value = input.value.trim();
    if (!value) return;
    if (value.indexOf(':') !== -1) {
      let [hour, minute] = value.split(':');
      if (hour.length === 1) {
        hour = '0' + hour;
      }
      if (minute && minute.length === 1) {
        minute = '0' + minute;
      }
      input.value = hour + ':' + (minute || '00');
    } else {
      if (value.length === 2) {
        // Assume it's hour only.
        input.value = value + ':00';
      } else if (value.length === 3 || value.length === 4) {
        let hourPart = value.slice(0, value.length - 2);
        let minutePart = value.slice(-2);
        if (hourPart.length === 1) {
          hourPart = '0' + hourPart;
        }
        input.value = hourPart + ':' + minutePart;
      }
    }
  };

  const autoInsertColon = (input) => {
    const value = input.value.trim();
    if (value && value.indexOf(':') === -1 && value.length === 2) {
      input.value = value + ':';
    }
  };

  document.getElementById('estimation').addEventListener('blur', function () {
    formatTime(this);
  });
  document.getElementById('estimation').addEventListener('keyup', function () {
    autoInsertColon(this);
  });

  // NEW: Autoformat for the spent-hours input field
  document.getElementById('spent-hours').addEventListener('blur', function () {
    formatTime(this);
  });
  document.getElementById('spent-hours').addEventListener('keyup', function () {
    autoInsertColon(this);
  });

  document.addEventListener('blur', (e) => {
    if (e.target && (e.target.id === 'edit-estimation' || e.target.id === 'comment-hours')) {
      formatTime(e.target);
    }
  }, true);
  document.addEventListener('keyup', (e) => {
    if (e.target && (e.target.id === 'edit-estimation' || e.target.id === 'comment-hours')) {
      autoInsertColon(e.target);
    }
  }, true);
});

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  const emoji = type === 'success' ? '🎉' : '⚠️';
  toast.textContent = `${emoji} ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showLoadingSpinner() {
  return `<div class="sk-chase">
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
  </div>`;
}

function celebrateCompletion() {
  confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
  });
}

function getStatusEmoji(status) {
  const emojis = {
      'Yet-to-start': '🆕',
      'In-Progress': '⚡',
      'Hold': '⏸️',
      'Completed': '✅',
      'Closed': '🔒'
  };
  return emojis[status] || '📋';
}
