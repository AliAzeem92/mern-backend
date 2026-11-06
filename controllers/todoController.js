import { Todo } from "../models/todoModel.js";

// Get all todos for the logged-in user
export const getTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: todos.length,
            todos,
        });
    } catch (error) {
        console.error("GetTodos Error:", error);
        return res.status(500).json({
            message: "Failed to fetch todos",
            success: false,
            errorMessage: error.message,
        });
    }
};

// Get single todo by ID
export const getTodoById = async (req, res) => {
    try {
        const todo = await Todo.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found",
                success: false,
            });
        }

        return res.status(200).json({
            success: true,
            todo,
        });
    } catch (error) {
        console.error("GetTodoById Error:", error);
        return res.status(500).json({
            message: "Failed to fetch todo",
            success: false,
            errorMessage: error.message,
        });
    }
};

// Create a new todo
export const createTodo = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required",
                success: false,
            });
        }

        const newTodo = await Todo.create({
            title,
            description,
            user: req.user._id,
        });

        return res.status(201).json({
            message: "Todo created successfully",
            success: true,
            todo: newTodo,
        });
    } catch (error) {
        console.error("CreateTodo Error:", error);
        return res.status(500).json({
            message: "Failed to create todo",
            success: false,
            errorMessage: error.message,
        });
    }
};

// Update a todo (title, description, completed status)
export const updateTodo = async (req, res) => {
    try {
        const { title, description, completed } = req.body;

        const todo = await Todo.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found",
                success: false,
            });
        }

        if (title !== undefined) todo.title = title;
        if (description !== undefined) todo.description = description;
        if (completed !== undefined) todo.completed = Boolean(completed);

        const updatedTodo = await todo.save();

        return res.status(200).json({
            message: "Todo updated successfully",
            success: true,
            todo: updatedTodo,
        });
    } catch (error) {
        console.error("UpdateTodo Error:", error);
        return res.status(500).json({
            message: "Failed to update todo",
            success: false,
            errorMessage: error.message,
        });
    }
};

// Delete a todo
export const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "Todo deleted successfully",
            success: true,
            id: req.params.id,
        });
    } catch (error) {
        console.error("DeleteTodo Error:", error);
        return res.status(500).json({
            message: "Failed to delete todo",
            success: false,
            errorMessage: error.message,
        });
    }
};
