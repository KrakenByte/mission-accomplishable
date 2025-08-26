import { Project } from "./project.js";

const STORAGE_KEY = "myTaskApp";

export function saveToStorage() {
  const projects = Array.from(Project.projectMap.values()).map(p => p.toJSON());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  console.log("Saved to local storage.");
}

export function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const projects = JSON.parse(raw);
    projects.forEach(pObj => {
      const proj = Project.fromJSON(pObj);
      Project.projectMap.set(proj.id, proj);
    });
  } catch (err) {
    console.error("Failed to load projects from localStorage:", err);
  }
}