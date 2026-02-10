import express from "express";
import {
  createProject,
  deleteProject,
  getPrivateProjectsUser,
  getProjectById,
  getPublicProjectsUser,
  getUserProjects,
  updateProject,
} from "../controller/project.controller";
import { verifyUser } from "../middleware/verifyUser";

const router = express.Router();

router.get("/private/:userId", verifyUser, getPrivateProjectsUser);
router.get("/public/:userId", verifyUser, getPublicProjectsUser);
router.get("/:id", verifyUser, getProjectById);
router.get("/", verifyUser, getUserProjects);
router.post("/", verifyUser, createProject);
router.put("/", verifyUser, updateProject);
router.delete("/", verifyUser, deleteProject);

const ProjectRouter = router;
export default ProjectRouter;
