import "./reset.css";
import "./style.css";

import { Project } from "./models/project.js";
import { Task } from "./models/task.js";
import { renderProjectList, renderProject } from "./views/renderer.js";
import {
  InitEventListeners,
  InitModalEventListeners,
} from "./controllers/controller.js";
import { loadFromStorage, saveToStorage } from "./models/storage.js";

// Load projects from storage
const storedProjects = loadFromStorage();
if (storedProjects && storedProjects.length > 0) {
  storedProjects.forEach((proj) => Project.fromJSON(proj));

  // Set active project if none is active
  if (!Project.getActiveProject()) {
    const firstProj = Project.projectMap.values().next().value;
    if (firstProj) Project.setActiveProject(firstProj.id);
  }
}

// Check for first visit and create default project only once
const isFirstVisit = !localStorage.getItem("hasVisited");
if (isFirstVisit && Project.projectMap.size === 0) {
  const defaultProject = new Project(
    "My First Project",
    "A demo project with diverse tasks"
  );

  const now = Date.now();
  defaultProject.addTask(
    new Task("Buy groceries", "pending", 2, new Date(now + 24 * 60 * 60 * 1000))
  );
  defaultProject.addTask(
    new Task(
      "Finish report",
      "in-progress",
      1,
      new Date(now + 3 * 24 * 60 * 60 * 1000)
    )
  );
  defaultProject.addTask(
    new Task("Call plumber", "done", 3, new Date(now - 2 * 24 * 60 * 60 * 1000))
  );
  defaultProject.addTask(new Task("Read new book", "pending", 3));
  defaultProject.addTask(
    new Task("Workout", "in-progress", 2, new Date(now + 6 * 60 * 60 * 1000))
  );

  Project.setActiveProject(defaultProject.id);

  // Mark first visit so default project is never recreated
  localStorage.setItem("hasVisited", "true");

  // Save to storage
  saveToStorage();
}

// Render projects and active project
renderProjectList();

// Handle no projects vs projects exist but none selected
if (Project.projectMap.size === 0) {
  // No projects exist at all
  document.querySelector("#content").innerHTML = "<h1>No projects yet...</h1>";
} else if (!Project.getActiveProject()) {
  // Projects exist but none selected
  document.querySelector("#content").innerHTML =
    "<h1>Select a project to see tasks</h1>";
} else {
  // Render active project
  renderProject(Project.getActiveProject());
}

// Initialize event listeners
InitEventListeners();
InitModalEventListeners();
