import { Request, Response } from "express";
import { Task } from "../models/taskModel";
import { taskUpdateSchema } from "../zodSchemas/taskSchema";
import { AuthRequest } from "../middleware/auth";

// Get all tasks
export const getAllTasks = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		// Only get tasks for the authenticated user
		const tasks = await Task.find({ userId: req.userId });
		const formattedTasks = tasks.map((task) => ({
			id: task._id,
			title: task.title,
			description: task.description,
			status: task.status,
			dueDate: task.dueDate,
		}));
		res.json(formattedTasks);
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
};

// Get task by ID
export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		// Only get task if it belongs to the authenticated user
		const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
		if (!task) {
			res.status(404).json({ message: "Task not found" });
			return;
		}
		res.json(task);
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
};

// Create new task with validation
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description = "", dueDate = "", status = "todo" } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const task = new Task({ title, description, dueDate, status, userId: req.userId });
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Update task with validation
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  // Validate incoming data (partial)
  const validation = taskUpdateSchema.safeParse(req.body);
  if (!validation.success) {
    console.log("Zod validation errors:", validation.error.errors);
    res.status(400).json({ errors: validation.error.errors });
    return;
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    Object.assign(task, req.body); // merge updates
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete task
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
	try {
		// Only delete task if it belongs to the authenticated user
		const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
		if (!task) {
			res.status(404).json({ message: "Task not found" });
			return;
		}

		await Task.deleteOne({ _id: req.params.id });
		res.json({ message: "Task deleted" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Internal server error" });
	}
};
