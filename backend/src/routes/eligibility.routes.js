import express from "express";
import { checkEligibility, recommendedSchemes } from "../controllers/eligibility.controller.js";

const router = express.Router();

router.post("/check-eligibility", checkEligibility);
router.get("/recommended-schemes", recommendedSchemes);

export default router;
