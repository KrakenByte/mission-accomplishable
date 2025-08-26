import { Project } from "../models/project";
import { renderProject, renderProjectList } from "../views/renderer";
import { Task } from "../models/task";
import { formatDistanceToNow } from "date-fns";
import { saveToStorage } from "../models/storage";

const modal = document.getElementById("form-modal");
const modalTitle = document.getElementById("modal-title");
const modalFieldsContainer = document.getElementById("modal-form-fields");
const modalSubmitBtn = document.getElementById("modal-submit-btn");
const cancelBtn = modal.querySelector(".cancel-btn");

function showFormModal(config) {
  modalTitle.textContent = config.title;
  modalSubmitBtn.textContent = config.submitText;
  modalFieldsContainer.innerHTML = "";

  // Create form fields
  config.fields.forEach((field) => {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.setAttribute("for", `modal-input-${field.name}`);
    label.textContent = field.label;

    let input;
    if (field.type === "select") {
      input = document.createElement("select");
      field.options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.text;
        if (opt.value == field.value) option.selected = true;
        input.appendChild(option);
      });
    } else {
      input = document.createElement("input");
      input.type = field.type;
      input.placeholder = field.placeholder || "";
      input.value = field.value || "";
    }

    input.id = `modal-input-${field.name}`;
    input.name = field.name;
    input.required = true;

    group.append(label, input);
    modalFieldsContainer.appendChild(group);
  });

  const form = document.getElementById("modal-form");

  form.onsubmit = null;

  form.onsubmit = function (e) {
    e.preventDefault();

    const data = {};
    config.fields.forEach((field) => {
      const el = document.getElementById(`modal-input-${field.name}`);
      data[field.name] = el.value;
    });

    config.onSubmit(data);
    hideModal();
  };

  modal.style.display = "flex";

  const firstInput = form.querySelector("input, select");
  if (firstInput) firstInput.focus();
}

function hideModal() {
  modal.style.display = "none";
}

modal.addEventListener("mousedown", (e) => {
  if (e.target === modal) {
    hideModal();
  }
});

modal.addEventListener("click", (e) => {
  if (e.target == cancelBtn) {
    hideModal();
  }
});

export function InitEventListeners() {
  const content = document.querySelector("#content");
  const projectListContainer = document.querySelector(
    ".project-list-container"
  );

  // Main content actions (tasks)
  content.addEventListener("click", (e) => {
    const project = Project.getActiveProject();
    if (!project) return;

    const taskDiv = e.target.closest(".task-container");
    let task;
    if (taskDiv) task = project.getTask(taskDiv.dataset.taskId);

    // Edit Task
    if (e.target.classList.contains("edit-task-btn") && task) {
      showFormModal({
        title: "Edit Task",
        submitText: "Update",
        fields: [
          {
            name: "title",
            label: "Task Title",
            type: "text",
            value: task.title,
          },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            value: task.priority,
            options: [
              { value: 1, text: "High" },
              { value: 2, text: "Medium" },
              { value: 3, text: "Low" },
            ],
          },
          {
            name: "dueDate",
            label: "Due Date & Time",
            type: "datetime-local",
            value: task.dueDate ? task.dueDate.toISOString().slice(0, 16) : "",
          },
        ],
        onSubmit: (data) => {
          // Update task including dueDate
          task.update({ title: data.title, priority: data.priority });
          task.dueDate = data.dueDate ? new Date(data.dueDate) : null;
          renderProject(project);
          saveToStorage();
        },
      });
    }

    // Toggle due date display
    if (e.target.classList.contains("task-due-date") && task) {
      const dueDateEl = e.target;
      const showingRelative = dueDateEl.dataset.showingRelative !== "false";

      if (showingRelative) {
        dueDateEl.textContent = task.dueDate.toLocaleDateString();
        dueDateEl.dataset.showingRelative = "false";
      } else {
        dueDateEl.textContent = formatDistanceToNow(task.dueDate, {
          addSuffix: true,
        });
        dueDateEl.dataset.showingRelative = "true";
      }
    }

    // Toggle status
    if (e.target.classList.contains("status") && task) {
      const statusCycle = {
        pending: "in-progress",
        "in-progress": "done",
        done: "pending",
      };
      task.changeStatus(statusCycle[task.status]);
      renderProject(project);
      saveToStorage();
    }

    // Remove task
    if (e.target.classList.contains("task-checkbox") && task) {
      project.removeTask(task.id);
      renderProject(project);
      saveToStorage();
    }

    // Sorting
    if (e.target.classList.contains("sort")) {
      if (e.target.classList.contains("priority-sort"))
        project.sortByPriority();
      if (e.target.classList.contains("status-sort")) project.sortByStatus();
      renderProject(project);
      saveToStorage();
    }
  });

  // Add task form submission
  content.addEventListener("submit", (e) => {
    if (!e.target.classList.contains("add-task-form")) return;
    e.preventDefault();

    const project = Project.getActiveProject();
    if (!project) return;

    const dueDateValue = e.target.dueDate?.value
      ? new Date(e.target.dueDate.value)
      : null;

    project.addTask(
      new Task(
        e.target.title.value,
        "pending",
        parseInt(e.target.priority.value, 10),
        dueDateValue
      )
    );
    saveToStorage();

    renderProject(project);
    e.target.reset();
    document.getElementById("form-input").focus();
  });

  // Sidebar actions
  projectListContainer.addEventListener("click", (e) => {
    const projectDiv = e.target.closest(".sidebar-project-div");
    if (!projectDiv) return;
    const projectId = projectDiv.dataset.projectId;

    // Edit Project
    if (e.target.classList.contains("edit-project-btn")) {
      const project = Project.projectMap.get(projectId);
      if (!project) return;

      showFormModal({
        title: "Edit Project",
        submitText: "Save Changes",
        fields: [
          {
            name: "name",
            label: "Project Name",
            type: "text",
            value: project.name,
          },
          {
            name: "description",
            label: "Description",
            type: "text",
            value: project.description,
          },
        ],
        onSubmit: (data) => {
          project.update(data.name, data.description);
          renderProjectList();
          if (Project.getActiveProject()?.id === projectId)
            renderProject(project);
        },
      });
      saveToStorage();
      return;
    }

    // Remove Project
    if (e.target.classList.contains("remove-project-btn")) {
      // Delete the project from the map
      Project.projectMap.delete(projectId);

      // Update active project if necessary
      if (Project.getActiveProject()?.id === projectId) {
        const firstProject = Project.projectMap.values().next().value || null;
        Project.setActiveProject(firstProject ? firstProject.id : null);
      }

      // Save changes to storage
      saveToStorage();

      // Re-render sidebar
      renderProjectList();

      // Render active project or fallback message
      const activeProject = Project.getActiveProject();
      const content = document.querySelector("#content");
      if (activeProject) {
        renderProject(activeProject);
      } else {
        content.innerHTML = "<h1>No projects yet...</h1>";
      }

      return;
    }
    // Switch active project
    Project.setActiveProject(projectId);
    renderProjectList();
    renderProject(Project.getActiveProject());
  });
}

export function InitModalEventListeners() {
  const newProjectBtn = document.querySelector(".new-project-btn");
  newProjectBtn.addEventListener("click", () => {
    showFormModal({
      title: "Create New Project",
      submitText: "Create",
      fields: [
        {
          name: "name",
          label: "Project Name",
          type: "text",
          placeholder: "Enter project name",
        },
        {
          name: "description",
          label: "Description",
          type: "text",
          placeholder: "Enter project description",
        },
      ],
      onSubmit: (data) => {
        if (!data.name.trim()) return;
        const project = new Project(data.name, data.description);
        Project.setActiveProject(project.id);
        renderProjectList();
        renderProject(project);
        saveToStorage();
      },
    });
  });
}
