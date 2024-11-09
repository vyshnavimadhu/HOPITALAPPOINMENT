const jwt = require('jsonwebtoken');

require('dotenv').config();
const CODE = process.env.JSON_KEY;

function authHospital (req, res, next) {
    const hospitalToken = req.cookies.hospitalToken;

    if (!authHospital) {
        return res.redirect('/hospital/');
    }

    try {
        // verify and decode the token
        const hospital = jwt.verify(hospitalToken, CODE);
        req.hospital = hospital;
        next();
        
    } catch (error) {
        res.clearCookie('hospitalToken');
        return res.redirect('/hospital/');
    }
}

module.exports = authHospital;