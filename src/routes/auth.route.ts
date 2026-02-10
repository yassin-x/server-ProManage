import express from "express";
import {
  login,
  logout,
  profileUser,
  refreshToken,
  register,
} from "../controller/auth.controller";
import { verifyUser } from "../middleware/verifyUser";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/refresh-token", verifyUser, refreshToken);
router.get("/user-profile", verifyUser, profileUser);
router.post("/logout", verifyUser, logout);

const AuthRouter = router;
export default AuthRouter;
