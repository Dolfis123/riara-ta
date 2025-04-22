const express = require("express");
const router = express.Router();
const controller = require("../controllers/pegawaiController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Public
router.post("/register", controller.register);
router.post("/login", controller.login);
router.put("/:id", authenticateToken, controller.update);
router.get('/pegawai-only',authenticateToken , controller.getAllPegawaiOnly);
// Protected
router.get("/", authenticateToken, controller.getAll);
router.put("/:id", authenticateToken, controller.update);
router.delete("/:id", authenticateToken, controller.remove);

module.exports = router;
