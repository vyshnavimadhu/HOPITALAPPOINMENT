const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

require('dotenv').config();
const CODE = process.env.JSON_KEY;

async function adminLogin (req, res) {
    res.render('admin/login');
}

// handle admin login requests
async function adminLoginProcess (req, res) {
    try {
        const {username, password} = req.body;
        console.log(`${username} ${password}`);
        
        const admin = await prisma.Admin.findUnique({
            where: {
                username: username
            }
        });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found"});
        }

        let isPassVaild = false;

        if ((admin.pwd) === password) {
            isPassVaild = true;
        }

        if (!isPassVaild) {
            return res.status(401).json({message: "Invaild password"})
        }

        const token = jwt.sign({ adminId: admin.id }, CODE, { expiresIn: '1h' });

        res.cookie("adminToken", token, { httpOnly: true });

        res.redirect('/admin/index');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
}

async function adminLogout (req, res) {  
    res.clearCookie('adminToken');
    return res.redirect('/admin/');
}

async function home(req, res) {
    try {
        // Get total count of hospitals
        const totalHospitals = await prisma.hospital.count();

        // Get total count of doctors
        const totalDoctors = await prisma.doctor.count();

        // Get total count of users (patients)
        const totalUsers = await prisma.patient.count();

        // Get total count of appointments
        const totalAppointments = await prisma.appointment.count();

        // Pass the counts to the view
        res.render('admin/index', {
            totalHospitals,
            totalDoctors,
            totalUsers,
            totalAppointments
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}



// global page
async function login(req, res) {
    try {
        res.render('login')
    } catch (error) {
        console.error(error);
    }
}

async function register(req, res) {
    try {
        res.render('register')
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    adminLogin, adminLoginProcess, home, adminLogout,
    login, register,
};