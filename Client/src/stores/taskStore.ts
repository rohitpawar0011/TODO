import { create } from "zustand";
import { api } from "../utils/api";

// API root handled by axios instance

export interface Task {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	status: string;
}

export interface TaskStore {
	tasks: Task[];
	selectedTask: Task | null;
	setTasks: (tasks: Task[]) => void;
	setSelectedTask: (task: Task | null) => void;
	addTask: (task: Task) => void;
	updateTask: (task: Task) => void;
	deleteTask: (taskId: string) => void;
	fetchTasks: () => Promise<void>;
	fetchTask: (id: string) => Promise<void>;
	createTask: (task: Omit<Task, "id">) => Promise<void>;
	updateTaskById: (id: string, task: Partial<Task>) => Promise<void>;
	deleteTaskById: (id: string) => Promise<void>;
}

// Helper function to transform MongoDB document to our Task interface
const transformMongoDocument = (doc: any): Task => {
	return {
		id: doc._id || doc.id, // Use _id if available, fallback to id
		title: doc.title,
		description: doc.description,
		dueDate: doc.dueDate,
		status: doc.status
	};
};

export const useTaskStore = create<TaskStore>((set) => ({
	tasks: [],
	selectedTask: null,

	setTasks: (tasks) => set({ tasks }),

	setSelectedTask: (task) => set({ selectedTask: task }),

	addTask: (task) =>
		set((state) => ({
			tasks: [...state.tasks, task],
		})),

	updateTask: (task) =>
		set((state) => ({
			tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
		})),

	deleteTask: (taskId) =>
		set((state) => ({
			tasks: state.tasks.filter((t) => t.id !== taskId),
		})),

	fetchTasks: async () => {
		try {
			const response = await api.get(`/api/tasks`);
			set({ tasks: response.data });
		} catch (error) {
			console.error("Error fetching tasks:", error);
		}
	},

	fetchTask: async (id) => {
		try {
			const response = await api.get(`/api/tasks/${id}`);
			const task = transformMongoDocument(response.data);
			set({ selectedTask: task });
		} catch (error) {
			console.error("Error fetching task:", error);
		}
	},

	createTask: async (task) => {
		try {
			const response = await api.post(`/api/tasks`, task);
			const newTask = transformMongoDocument(response.data);
			set((state) => ({ tasks: [...state.tasks, newTask] }));
		} catch (error) {
			console.error("Error creating task:", error);
			throw error;
		}
	},

	updateTaskById: async (id, task) => {
		try {
			const response = await api.put(`/api/tasks/${id}`, task);
			const updatedTask = transformMongoDocument(response.data);
			set((state) => ({
				tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
			}));
		} catch (error) {
			console.error("Error updating task:", error);
		}
	},

	deleteTaskById: async (id) => {
		try {
			await api.delete(`/api/tasks/${id}`);
			set((state) => ({
				tasks: state.tasks.filter((t) => t.id !== id),
			}));
		} catch (error) {
			console.error("Error deleting task:", error);
		}
	},
}));
