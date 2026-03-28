// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//         user: "samuelsgn8@gmail.com",
//         pass: "chfhzodljqyrgsqa"
//     }
// });

// const mailOptions = {
//     from: "samuelsgn8@gmail.com",
//     to: "soglohounsamuel2@gmail.com",
//     subject: "Tests code SMTP",
//     text: "Il aimerait que tu lui dises si je suis un bon dev."
// };

// async function sendTestMail() {
//   try {
//     const info = await transporter.sendMail({
//       from: 'samuelsgn8@gmail.com',
//       to: "soglohounsamuel2@gmail.com",
//       subject: "Test SMTP Node.js",
//       text: "Email envoyé avec succès depuis Node.js 🚀"
//     });

//     console.log("Email envoyé :", info.messageId);
//   } catch (error) {
//     console.error("Erreur :", error);
//   }
// }


// // transporter.sendMail(mailOptions, (err, info) => {
// //     if (err) {
// //         console.log(err);
// //     } else {
// //         console.log(info);
// //     }
// // });

// sendTestMail();

const dotenv = require("dotenv");
dotenv.config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testDB() {
  const res = await pool.query("SELECT NOW()");
  console.log(res.rows);
}

testDB();