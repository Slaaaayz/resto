// Routes admin : inspection brute des bases (debug / verification de seed).

import { Router } from "express";
import { getDump } from "../controllers/admin.controller.js";

const router = Router();

router.get("/dump", getDump);

export default router;
