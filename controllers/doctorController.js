const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

require('dotenv').config();
const CODE = process.env.JSON_KEY;

async function login (req, res) {
    res.render('doctor/login');
}

async function dashboard (req, res) {
    try {
        const doctorDetails = req.doctor;
        const pk = doctorDetails.doctorId;
        
        const doctor = await prisma.Doctor.findUnique({
            where: { id: pk },
            include: {
                hospital: true,
                department: true,
                appointments: true,
            }
        });

        let successMsg = req.flash('success');
        let errorMsg = req.flash('error');

        // Check if there are any messages
        if (successMsg.length > 0) {
            console.log('true success');
        } 

        if (errorMsg.length > 0) {
            console.log('true error');
}

        res.render('doctor/dashboard', { 
            data: doctor,
            success: successMsg,
            error: errorMsg,
        });
    } catch (error) {
        console.error(error);
    }
}

async function updateAvailability(req, res) {
    const doctorId = parseInt(req.params.id);
    const { isAvailable } = req.body;

    try {
        // Update the doctor's availability in the database
        await prisma.doctor.update({
        where: { id: doctorId },
        data: { isAvailable: true } // Convert to boolean
        });

        res.redirect('/doctor/dashboard'); // Redirect back to the doctor listing page or wherever you need
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating doctor availability');
    }
}

async function addSlots(req, res) {
    const doctorId = parseInt(req.params.doctorId);
    const slotsno = parseInt(req.body.slots);

    const currentDate = new Date();
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    // Convert 'today' to ISO 8601 format (but only care about the date, not time)
    const formattedToday = today.toISOString().split('T')[0]; 

    try {
        // Check if slots already exist for the doctor on the current date
        const existingSlots = await prisma.availableSlots.findFirst({
            where: {
                doctorId: doctorId,
                date: {
                    gte: new Date(formattedToday), // Start of the current day
                    lt: new Date(new Date(formattedToday).setDate(today.getDate() + 1)) // Start of the next day
                }
            }
        });

        if (existingSlots) {
            req.flash('error', 'Slots have already been added for today.');
            return res.redirect(`/doctor/dashboard`);
        }

        // If no slots exist, create a new entry
        await prisma.availableSlots.create({
            data: {
                slotsno: slotsno,
                doctorId: doctorId,
            }
        });

        req.flash('success', 'Slots added successfully!');
        res.redirect('/doctor/dashboard'); 
    } catch (error) {
        req.flash('error', 'Internal server error');
    }
}

async function appoinmentList(req, res) {
    try {
        const doctorDetails = req.doctor;
        const pk = doctorDetails.doctorId;
        
        const doctor = await prisma.Doctor.findUnique({
            where: { id: pk },
            include: {
                hospital: true,
                department: true,
                appointments: true,
            }
        });

        const appoiment = await prisma.Appointment.findMany({
            where: { doctorId: parseInt(pk) },
            include: {
                hospital: true,
                doctor: true,
                patient: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        res.render('doctor/appoinmentList', { data: doctor, appoiment });
    } catch (error) {
        console.error(error);
    }
}

async function slotZero(req, res) {
    const id = parseInt(req.params.id);
    try {
        const setzero = await prisma.Doctor.update({
            where: { id: id },
            data: {
                isAvailable: false,
            }
        });

        res.redirect('/doctor/dashboard'); 
    } catch (error) {
        console.error(error);
    }
}

async function doctorLoginProcess (req, res) {
    try {
        const { email, password } = req.body;
        
        const doc = await prisma.Doctor.findUnique({
            where: {
                email: email
            }
        });

        if (!doc) {
            return res.status(404).json({ message: "Doctor is not found"});
        }

        let isPassVaild = false;

        if ((doc.password) === password) {
            isPassVaild = true;
        }

        if (!isPassVaild) {
            return res.status(401).json({message: "Invaild password"})
        }

        const token = jwt.sign({ doctorId: doc.id }, CODE, { expiresIn: '1h' });

        res.cookie("doctorToken", token, { httpOnly: true });

        res.redirect('/doctor/dashboard');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
}

async function doctorLogout (req, res) {  
    res.clearCookie('doctorToken');
    return res.redirect('/doctor/');
}


module.exports = {
    login, doctorLogout, dashboard, doctorLoginProcess,
    updateAvailability, addSlots, appoinmentList, slotZero
}