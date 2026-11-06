import express from "express";
import {
    getTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
} from "../controllers/todoController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.route("/")
    .get(getTodos)
    .post(createTodo);

router.route("/:id")
    .get(getTodoById)
    .put(updateTodo)
    .delete(deleteTodo);

export default router;
