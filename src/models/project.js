import { v4 as uuidv4 } from "uuid";
import { Task } from "./task";

export class Project {
  static projectMap = new Map();
  static statusOrder = { "in-progress": 1, pending: 2, done: 3 };
  static activeProjectId = null;

  constructor(name, description, autoAdd = true) {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
    this.list = [];
    if (autoAdd) Project.projectMap.set(this.id, this);
  }

  // Convenience method to update project properties from form data
  update(name, description) {
    this.name = name;
    this.description = description;
  }

  static setActiveProject(id) {
    this.activeProjectId = id;
  }

  static getActiveProject() {
    return this.projectMap.get(this.activeProjectId);
  }

  addTask(task) {
    this.list.push(task);
  }

  removeTask(taskId) {
    this.list = this.list.filter((task) => task.id !== taskId);
  }

  sortByPriority(desc = false) {
    this.list.sort((a, b) =>
      desc ? b.priority - a.priority : a.priority - b.priority
    );
  }

  sortByStatus() {
    this.list.sort(
      (a, b) =>
        Project.statusOrder[a.status.toLowerCase()] -
        Project.statusOrder[b.status.toLowerCase()]
    );
  }

  printTodos() {
    console.log(this.list.map((task) => ({ ...task })));
  }

  getTask(taskId) {
    return this.list.find((t) => t.id === taskId) || null;
  }

  getTaskProperty(taskId, prop) {
    const task = this.getTask(taskId);
    return task ? task[prop] : null;
  }

  setTaskProperty(taskId, prop, value) {
    const task = this.getTask(taskId);
    if (task) task[prop] = value;
  }

  getTaskStatus(id) {
    return this.getTaskProperty(id, "status");
  }
  setTaskStatus(id, status) {
    this.setTaskProperty(id, "status", status);
  }

  getTaskPriority(id) {
    return this.getTaskProperty(id, "priority");
  }
  setTaskPriority(id, priority) {
    this.setTaskProperty(id, "priority", priority);
  }

  static removeProject(projectId) {
    Project.projectMap.delete(projectId);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      list: this.list.map((task) => task.toJSON()),
    };
  }

  static fromJSON(obj) {
    const proj = new Project(obj.name, obj.description, false);
    proj.id = obj.id;
    proj.list = obj.list.map(Task.fromJSON);
    Project.projectMap.set(proj.id, proj);
    return proj;
  }
}
