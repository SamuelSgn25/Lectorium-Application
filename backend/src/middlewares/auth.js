require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const connection = require('../config/db');

function isValidMail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function CheckEmail(req, res, next) {
    let isValid = isValidMail(req.body.email);
    if (isValid) {
        next();
    } else {
        res.status(401).send("Incorrect email format");
    }
}

function checkRegex(string) {
    return /^[A-Za-z0-9]*$/.test(string);
}

function isValidPassword(password) {
    let isValidPass = checkRegex(password);
    if (password.length >= 8 && isValidPass === true) {
        return true;
    }
    return false;
}

function CheckPassword(req, res, next) {
    let password = isValidPassword(req.body.password);
    if (password) {
        next();
    } else {
        res.status(401).send("Incorrect password format");
    }
}

function CheckEmailExists(req, res, next) {
    const query_mail = 'SELECT * FROM User where email = ?';
    connection.query(query_mail, [req.body.email], function(err, result) {
        if (err) {
            res.send(err);
        } else {
            if (result.length >= 0) {
                res.send("Account Already Exists");
            } else {
                next();
            }
        }
    });
}

module.exports = {
    CheckEmail,
    CheckPassword,
    CheckEmailExists
}
