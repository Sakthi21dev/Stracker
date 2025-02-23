document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('tasks-table-body');
  const keywordInput = document.getElementById('filter-keyword');
  const statusSelect = document.getElementById('filter-status');
  const sortSelect = document.getElementById('sort-option');
  const commentDateInput = document.getElementById('filter-comment-date');
  const startDateInput = document.getElementById('filter-start-date');
  const endDateInput = document.getElementById('filter-end-date');
  
  // Load tasks from localStorage and filter tasks with comments
  let tasks = (JSON.parse(localStorage.getItem('tasks')) || []).filter(task => task.comments && task.comments.length > 0);
  
  function renderTable() {
    let filteredTasks = tasks.slice();
    const keyword = keywordInput.value.trim().toLowerCase();
    const statusFilter = statusSelect.value;
    const commentDate = commentDateInput.value; // new filter
    const startDateFilter = startDateInput.value;
    const endDateFilter = endDateInput.value;
    
    // Apply keyword filter (search in task name)
    if (keyword) {
      filteredTasks = filteredTasks.filter(task => task.name.toLowerCase().includes(keyword));
    }
    
    // Apply status filter
    if (statusFilter) {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    // Apply comment date filter: keep only tasks with at least one comment that matches, and use matching comments for display
    if (commentDate) {
      filteredTasks = filteredTasks.filter(task => task.comments.some(comment => comment.date === commentDate));
    }
    
    // Apply start date filter (only tasks with startDate >= filter)
    if (startDateFilter) {
      filteredTasks = filteredTasks.filter(task => new Date(task.startDate) >= new Date(startDateFilter));
    }
    
    // Apply end date filter (only tasks with startDate <= filter)
    if (endDateFilter) {
      filteredTasks = filteredTasks.filter(task => new Date(task.startDate) <= new Date(endDateFilter));
    }
    
    // Apply sorting based on the selected option
    const sortVal = sortSelect.value;
    if (sortVal === 'name-asc') {
      filteredTasks.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortVal === 'name-desc') {
      filteredTasks.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortVal === 'startDate-asc') {
      filteredTasks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    } else if (sortVal === 'startDate-desc') {
      filteredTasks.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }
    
    // Render table rows
    tableBody.innerHTML = '';
    if (filteredTasks.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No tasks with comments found.</td></tr>';
      return;
    }
    
    filteredTasks.forEach(task => {
      // Determine which comments to display based on the comment date filter.
      const commentsToDisplay = commentDate ? task.comments.filter(comment => comment.date === commentDate) : task.comments;
      const commentsHtml = commentsToDisplay.map(comment => 
        `Text: ${comment.text}<br/><em>Date: ${comment.date}, Hours: ${comment.hours}</em>`
      ).join('<hr/>');
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${task.id}</td>
        <td>${task.name}</td>
        <td>${task.desc}</td>
        <td>${task.startDate}</td>
        <td>${task.estimation}</td>
        <td>${task.status}</td>
        <td>${commentsHtml}</td>
      `;
      row.classList.add('fade-in'); // New: Apply fade-in on row
      tableBody.appendChild(row);
    });
  }
  
  // Attach event listeners to update table on change
  [keywordInput, statusSelect, sortSelect, commentDateInput, startDateInput, endDateInput].forEach(input => {
    input.addEventListener('input', renderTable);
  });
  
  // Add sync: Listen for storage events and refresh table
  window.addEventListener('storage', (e) => {
    if (e.key === 'tasks') {
      tasks = (JSON.parse(localStorage.getItem('tasks')) || []).filter(task => task.comments && task.comments.length > 0);
      renderTable();
    }
  });
  
  // Initial render
  renderTable();
});
