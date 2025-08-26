import { v4 as uuidv4 } from "uuid";

export class Task {
  static allowedStatuses = ["pending", "in-progress", "done"];
  static minPriority = 1;
  static maxPriority = 3;

  constructor(title, status = "pending", priority = 3, dueDate = null) {
    this.id = uuidv4();
    this.title = title;
    this.status = Task.allowedStatuses.includes(status) ? status : "pending";
    this.priority = typeof priority === "number" ? priority : Task.minPriority;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.dueDate = dueDate instanceof Date ? dueDate : null; // store Date object
  }

  // Convenience method to update task properties from form data
  update({ title, priority, dueDate }) {
    if (title !== undefined) this.changeTitle(title);
    if (priority !== undefined) this.changePriority(parseInt(priority, 10));
    if (dueDate !== undefined) {
      this.dueDate = dueDate ? new Date(dueDate) : null;
      this.updateTimestamp();
    }
  }


  updateTimestamp() {
    this.updatedAt = new Date();
  }

  changeTitle(newTitle) {
    this.title = newTitle;
    this.updateTimestamp();
  }

  changePriority(newPriority) {
    if (
      typeof newPriority === "number" &&
      newPriority >= Task.minPriority &&
      newPriority <= Task.maxPriority
    ) {
      this.priority = newPriority;
      this.updateTimestamp();
    } else {
      console.error(`Invalid priority: ${newPriority}`);
    }
  }

  changeStatus(newStatus) {
    if (Task.allowedStatuses.includes(newStatus)) {
      this.status = newStatus;
      this.updateTimestamp();
    } else {
      console.error(`Invalid status: ${newStatus}`);
    }
  }

  changeDueDate(date) {
    const parsedDate = date instanceof Date ? date : new Date(date);
    if (!isNaN(parsedDate)) {
      this.dueDate = parsedDate;
      this.updateTimestamp();
    }
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      dueDate: this.dueDate ? this.dueDate.toISOString() : null,
    };
  }

  static fromJSON(obj) {
    const task = new Task(obj.title, obj.status, obj.priority);
    task.id = obj.id;
    task.createdAt = new Date(obj.createdAt);
    task.updatedAt = new Date(obj.updatedAt);
    task.dueDate = obj.dueDate ? new Date(obj.dueDate) : null;
    return task;
  }

}
