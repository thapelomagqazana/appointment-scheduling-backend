const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Send email notification.
 *
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email text content
 */
const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text,
    };
    // console.log(mailOptions);
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("Email sent: " + info.response);
    });
};

/**
 * Schedule notifications for upcoming appointments.
 *
 * This function schedules notifications for appointments that are happening within the next hour.
 */
const scheduleNotifications = () => {
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        try {
            const appointments = await Appointment.find({
                date: {
                    $gte: now,
                    $lte: oneHourLater,
                },
            }).populate("patient").populate("doctor");

            appointments.forEach(appointment => {
                const { patient, doctor, date, reason } = appointment;
                const patientEmail = patient.email;
                const doctorEmail = doctor.email;

                const appointmentDate = new Date(date).toLocaleString();
                const subject = "Appointment Reminder";
                const text = `Reminder: You have an appointment scheduled on ${appointmentDate} for ${reason}.`;

                sendEmail(patientEmail, subject, text);
                sendEmail(doctorEmail, subject, text)
            });
        } catch (err) {
            console.error("Error fetching appointments: ", err.message);
        }
    });
};

module.exports = { scheduleNotifications, sendEmail };