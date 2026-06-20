import { Router } from "express";
import { sendHelpEmail } from "../controllers/helpController";

const router = Router();

router.post("/send", sendHelpEmail);

export default router;
