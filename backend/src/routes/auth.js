require("dotenv").config()
const express = require("express");
const Roads = express();
const connection = require('../config/db');
const jwt = require("jsonwebtoken");
const {CheckEmail, CheckEmailExists, CheckPassword} = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const body = require("body-parser");
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
let global = '';

Roads.use(express.json());

Roads.post('/signup', CheckEmail, CheckEmailExists, CheckPassword, (req, res) => {
    res.send('Account already exists');
});

Roads.post('/register', CheckEmailExists, function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var fullname = req.body.fullname;
    var phone = req.body.phone;

    let key = bcrypt.genSaltSync(10);
    global = bcrypt.hashSync(password, key)
    password = global;

    var data = [
        email,
        password,
        fullname,
        phone
    ];

    connection.query('INSERT INTO User(email, password, fullname, phone) VALUES(?,?,?,?)', data, function(err, result) {
        if (err) {
            console.error(err);
            res.status(500).json({message: "Invalid user informations"});
        } else {
            res.status(200).json({message: "The new user is successfully registered"});
        }
    });
});

module.exports = Roads;
