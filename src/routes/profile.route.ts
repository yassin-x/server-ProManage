import express from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
} from "../controller/profile.controller";
import { verifyUser } from "../middleware/verifyUser";

const router = express.Router();

router.get("/", verifyUser, getProfile);
router.post("/", verifyUser, createProfile);
router.put("/", verifyUser, updateProfile);

const ProfileRouter = router;
export default ProfileRouter;
