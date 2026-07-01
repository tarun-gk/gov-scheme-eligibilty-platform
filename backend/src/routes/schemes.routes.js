import express from "express";
import {
	fetchAllSchemes,
	fetchSchemeById,
	searchSchemesController,
} from "../controllers/schemes.controller.js";

const router = express.Router();

// GET all schemes
router.get("/", fetchAllSchemes);

// GET smart search
router.get("/search", searchSchemesController);

// GET scheme by id
router.get("/:id", fetchSchemeById);

export default router;
