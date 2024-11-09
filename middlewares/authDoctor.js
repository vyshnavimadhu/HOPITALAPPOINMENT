const jwt = require('jsonwebtoken');

require('dotenv').config();
const CODE = process.env.JSON_KEY;

function authDoctor (req, res, next) {
    const doctorToken = req.cookies.doctorToken;

    if (!authDoctor) {
        return res.redirect('/doctor/');
    }

    try {
        // verify and decode the token
        const doctor = jwt.verify(doctorToken, CODE);
        req.doctor = doctor;
        next();
        
    } catch (error) {
        res.clearCookie('doctorToken');
        return res.redirect('/doctor/');
    }
}

module.exports = authDoctor;