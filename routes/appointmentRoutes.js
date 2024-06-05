const express = require("express");
const auth = require("../middleware/auth");
const { createAppointment, getAppointments, updateAppointment, deleteAppointment } = require("../controllers/appointmentController");

const router = express.Router();

router.post("/create", auth, createAppointment);
router.get("/", auth, getAppointments);
router.put("/update/:id", auth, updateAppointment);
router.delete("/delete/:id", auth, deleteAppointment);

module.exports = router;