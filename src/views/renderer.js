import { Project } from "../models/project";
import { format, formatDistanceToNow } from "date-fns";

export function renderProject(project) {
  Project.activeProject = project;

  const content = document.querySelector("#content");
  content.innerHTML = "";

  const projectDiv = document.createElement("div");
  projectDiv.classList.add("project-container");
  projectDiv.dataset.projectId = project.id;

  // Header
  const projectHeader = document.createElement("div");
  projectHeader.classList.add("project-header");
  const projectName = document.createElement("h1");
  projectName.textContent = project.name;
  const projectDesc = document.createElement("p");
  projectDesc.textContent = project.description;

  const sortDiv = document.createElement("div");
  sortDiv.classList.add("sort-container");
  ["P", "S"].forEach((label, i) => {
    const btn = document.createElement("button");
    btn.classList.add(
      i === 0 ? "priority-sort" : "status-sort",
      "sort",
      "unselectable"
    );
    btn.textContent = label;
    sortDiv.appendChild(btn);
  });
  projectHeader.append(projectName, sortDiv);

  // Tasks
  const taskListDiv = document.createElement("div");
  taskListDiv.classList.add("task-list");
  project.list.forEach((task) => {
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task-container");
    taskDiv.dataset.taskId = task.id;

    const priorityClass = ["high-priority", "medium-priority", "low-priority"][
      task.priority - 1
    ];
    if (priorityClass) taskDiv.classList.add(priorityClass);

    // Group edit button and title
    const taskLeft = document.createElement("div");
    taskLeft.classList.add("task-left");

    const editTaskBtn = document.createElement("button");
    editTaskBtn.classList.add("edit-task-btn", "unselectable");
    editTaskBtn.textContent = "⋮";

    const taskTitle = document.createElement("h1");
    taskTitle.classList.add("task-title");
    taskTitle.textContent = task.title;
    if (task.status === "done") taskTitle.style.textDecoration = "line-through";
    if (task.status === "in-progress") taskTitle.style.fontStyle = "italic";
    taskTitle.style.fontWeight = [600, 500, 400][task.priority - 1] || 400;

    taskLeft.append(editTaskBtn, taskTitle);

    const taskRight = document.createElement("div");
    taskRight.classList.add("task-right");

    const taskStatus = document.createElement("p");
    taskStatus.classList.add("status", task.status, "unselectable");
    taskStatus.textContent = task.status;

    // Show due date if available
    if (task.dueDate) {
      const dueDateEl = document.createElement("p");
      dueDateEl.classList.add("task-due-date", "unselectable");

      // Initially show relative
      dueDateEl.textContent = formatDistanceToNow(task.dueDate, {
        addSuffix: true,
      });

      taskRight.appendChild(dueDateEl);
    }

    const taskCheckbox = document.createElement("button");
    taskCheckbox.textContent = "✔";
    taskCheckbox.classList.add("task-checkbox", "unselectable");

    taskRight.append(taskStatus, taskCheckbox);
    taskDiv.append(taskLeft, taskRight);
    taskListDiv.appendChild(taskDiv);
  });

  // Add-task form
  const addTaskForm = document.createElement("form");
  addTaskForm.classList.add("add-task-form");
  addTaskForm.dataset.projectId = project.id;
  addTaskForm.innerHTML = `
    <input type="text" name="title" id="form-input" placeholder="Task title" required />
    <input type="datetime-local" name="dueDate" />
    <select name="priority" class="unselectable">
      <option value="1">High</option>
      <option value="2">Medium</option>
      <option value="3" selected>Low</option>
    </select>
    <button type="submit" class="unselectable">Add Task</button>
  `;
  projectDiv.append(projectHeader, projectDesc, taskListDiv, addTaskForm);
  content.appendChild(projectDiv);
}
export function renderProjectList() {
  const projectListDiv = document.querySelector(".project-list-container");
  projectListDiv.innerHTML = "";

  Project.projectMap.forEach((proj) => {
    const projectDiv = document.createElement("div");
    projectDiv.classList.add("sidebar-project-div");
    projectDiv.dataset.projectId = proj.id;

    const projectHeader = document.createElement("div");
    projectHeader.classList.add("sidebar-project-header");
    const projectName = document.createElement("div");
    projectName.classList.add("sidebar-project-title");
    projectName.textContent = proj.name;

    const controlsDiv = document.createElement("div");
    controlsDiv.classList.add("sidebar-project-controls");

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-project-btn");
    editBtn.textContent = "⋮";

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-project-btn");
    removeBtn.textContent = "✕";

    controlsDiv.append(editBtn, removeBtn);
    projectHeader.append(projectName, controlsDiv);

    const projectDesc = document.createElement("p");
    projectDesc.classList.add("sidebar-project-desc");
    projectDesc.textContent = proj.description;

    projectDiv.append(projectHeader, projectDesc);
    projectListDiv.appendChild(projectDiv);
  });
}
