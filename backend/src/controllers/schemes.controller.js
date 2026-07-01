import { getAllSchemes, getSchemeById, searchSchemes } from "../services/schemes.service.js";

export async function fetchAllSchemes(req, res) {
  try {
    const schemes = await getAllSchemes();
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ message: "DB error", error: err.message });
  }
}

export async function fetchSchemeById(req, res) {
  try {
    const { id } = req.params;
    const scheme = await getSchemeById(id);

    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    res.json(scheme);
  } catch (err) {
    res.status(500).json({ message: "DB error", error: err.message });
  }
}

export async function searchSchemesController(req, res) {
  try {
    const q = req.query.q || "";
    const schemes = await searchSchemes(q);
    return res.status(200).json(schemes);
  } catch (err) {
    return res.status(500).json({ message: "Search failed", error: err.message });
  }
}
