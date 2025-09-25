$(document).ready(function () {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all";
  let searchQuery = "";

  // Save to localStorage
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Render tasks
  function renderTasks() {
    $("#taskList").empty();
    let filteredTasks = tasks.filter((task) => {
      const matchesFilter =
        (currentFilter === "active" && !task.completed) ||
        (currentFilter === "completed" && task.completed) ||
        currentFilter === "all";

      const matchesSearch =
        task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.tags &&
          task.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      return matchesFilter && matchesSearch;
    });

    filteredTasks.forEach((task, index) => {
      const dueDate = task.due ? new Date(task.due) : null;
      const isOverdue =
        dueDate && dueDate < new Date() && !task.completed ? "overdue" : "";
      const priorityBadge = task.priority
        ? `<span class="badge bg-${
            task.priority === "low"
              ? "success"
              : task.priority === "medium"
              ? "warning"
              : "danger"
          }">${task.priority}</span>`
        : "";
      const tagsBadges = task.tags
        ? task.tags
            .map((tag) => `<span class="badge bg-secondary">${tag}</span>`)
            .join(" ")
        : "";
      const dueText = dueDate
        ? `Due: ${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : "";

      const taskHtml = `
        <li class="list-group-item d-flex justify-content-between align-items-center" data-index="${index}">
          <div>
            <input type="checkbox" class="form-check-input me-2 task-checkbox" ${
              task.completed ? "checked" : ""
            }>
            <span class="task-text ${
              task.completed ? "completed" : ""
            }">${task.text}</span>
            <div class="small text-muted">
              ${priorityBadge} <span class="${isOverdue}">${dueText}</span> ${tagsBadges}
            </div>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-primary edit-task"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger delete-task"><i class="bi bi-trash"></i></button>
          </div>
        </li>
      `;
      $("#taskList").append(taskHtml);
    });

    updateQuickStats();
    updateProgressBar();
  }

  // Add task
  $("#addTask").click(function () {
    const taskText = $("#taskInput").val().trim();
    const category = $("#categoryInput").val();
    const priority = $("#priorityInput").val();
    const due = $("#dueInput").val();
    const tags = $("#tagsInput")
      .val()
      .trim()
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    if (taskText) {
      tasks.push({
        text: taskText,
        category: category || "General",
        completed: false,
        priority: priority || null,
        due: due || null,
        tags: tags.length ? tags : null,
      });

      $("#taskInput").val("");
      $("#priorityInput").val("");
      $("#dueInput").val("");
      $("#tagsInput").val("");

      saveTasks();
      renderTasks();
    }
  });

  // Mark complete
  $(document).on("change", ".task-checkbox", function () {
    const index = $(this).closest("li").data("index");
    tasks[index].completed = $(this).is(":checked");
    saveTasks();
    renderTasks();
  });

  // Delete
  $(document).on("click", ".delete-task", function () {
    const index = $(this).closest("li").data("index");
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  });

  // Edit task
  $(document).on("click", ".edit-task", function () {
    const index = $(this).closest("li").data("index");
    const newText = prompt("Edit Task:", tasks[index].text);
    if (newText !== null && newText.trim() !== "") {
      tasks[index].text = newText.trim();
      saveTasks();
      renderTasks();
    }
  });

  // Filters
  $("#filterAll").click(() => {
    currentFilter = "all";
    $(".filter-btns button").removeClass("active");
    $("#filterAll").addClass("active");
    renderTasks();
  });
  $("#filterActive").click(() => {
    currentFilter = "active";
    $(".filter-btns button").removeClass("active");
    $("#filterActive").addClass("active");
    renderTasks();
  });
  $("#filterCompleted").click(() => {
    currentFilter = "completed";
    $(".filter-btns button").removeClass("active");
    $("#filterCompleted").addClass("active");
    renderTasks();
  });

  // Search
  $("#searchInput").on("keyup", function () {
    searchQuery = $(this).val();
    renderTasks();
  });

  // Clear completed
  $("#clearCompleted").click(() => {
    tasks = tasks.filter((t) => !t.completed);
    saveTasks();
    renderTasks();
  });

  // Theme toggle
  $("#toggleTheme").click(function () {
    const theme = $("body").attr("data-bs-theme") === "light" ? "dark" : "light";
    $("body").attr("data-bs-theme", theme);
    $(this).text(theme === "light" ? "Dark Mode" : "Light Mode");
  });

  // Update Quick Stats
  function updateQuickStats() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const overdue = tasks.filter(
      (t) => t.due && new Date(t.due) < new Date() && !t.completed
    ).length;

    const stats = [total, completed, active, overdue];
    $("#quickStats .col").each(function (i) {
      $(this).find("h5").text(stats[i]);
    });
  }

  // Progress bar
  function updateProgressBar() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    $("#progressBarInner").css("width", `${percentage}%`);
  }

  // Initial render
  renderTasks();
});
