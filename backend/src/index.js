require("dotenv").config();
const mysql = require("mysql2");
const connection = require("./config/db");
const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const port = process.env.PORT;
const Roads = require('./routes/auth');

app.use(cors());
app.use(express.json());

app.use(Roads);

app.listen(port, () => {
    console.log("Lectorium Application Server launched successfully on http://localhost:" + port);
});
