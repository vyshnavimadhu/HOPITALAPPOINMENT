const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

require('dotenv').config();
const CODE = process.env.JSON_KEY;

async function login(req, res) {
    try {
        res.render('user/login');
    } catch (error) {
        console.error(error);
    }
}

async function register(req, res) {
    try {
        res.render('user/register');
    } catch (error) {
        console.error(error);
    }
}

async function registerUserData (req, res) {
    try {
        const { name, email, phone, password } = req.body;
        const addEmpData = await prisma.Patient.create({
            data: {
                name: name,
                email: email,
                phone: phone,
                password: password
            }
        });

        console.log('User added');
        res.redirect('/user/login');
    } catch (error) {
        console.error(error);
    }
}

// handle emp login requests
async function userLoginProcess (req, res) {
    try {
        const { email, password } = req.body;
        
        const user = await prisma.Patient.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found"});
        }

        let isPassVaild = false;

        if ((user.password) === password) {
            isPassVaild = true;
        }

        if (!isPassVaild) {
            return res.status(401).json({message: "Invaild password"})
        }

        const token = jwt.sign({ userId: user.id }, CODE, { expiresIn: '1h' });

        res.cookie("userToken", token, { httpOnly: true });

        res.redirect('/user/dashboard');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
}

async function userLogout (req, res) {  
    res.clearCookie('userToken');
    return res.redirect('/');
}

async function dashboard (req, res) {
    try {
        const userData = req.userOne;
        const pk = userData.userId;
        console.log(userData);

        const users = await prisma.Patient.findUnique({
            where: { id: parseInt(pk) }
        });
        res.render('user/dashboard', { data: users });
    } catch (error) {
        console.error(error);
    }
}

async function appoinmentBook (req, res) {
    try {
        const dId = parseInt(req.params.dId); // Get doctor ID from route parameters
        const uId = parseInt(req.params.uId); // Get user ID from route parameters

        const doctor = await prisma.Doctor.findUnique({
            where: { id: parseInt(dId) },
            include: { hospital: true } // Include hospital information
        });

        if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
        }

        const hospitalId = doctor.hospital.id; // Retrieve hospital ID from doctor

        const latestSlot = await prisma.AvailableSlots.findFirst({
            where: { doctorId: dId },
            orderBy: { date: 'desc' }, // Order by date to get the latest slot
        });

        if (!latestSlot) {
            console.log('No available slots found for this doctor.');
        }

        // Step 2: Decrease slotsno by 1
        if (latestSlot.slotsno > 0) {
            const updatedSlot = await prisma.AvailableSlots.update({
                where: { id: latestSlot.id },
                data: { slotsno: latestSlot.slotsno - 1 },
            });

            console.log('Slot number decreased successfully');
        } else {
            console.log('No slots available to decrease.');
        }

        const latestSlotZero = await prisma.AvailableSlots.findFirst({
            where: { doctorId: dId },
            orderBy: { date: 'desc' }, // Order by date to get the latest slot
        });

        if (!latestSlotZero) {
            console.log('No available slots found for this doctor.');
        }

        if (latestSlotZero.slotsno == 0) {
            const updateDoctorAvailable = await prisma.Doctor.update({
                where: { id: dId },
                data: { isAvailable: false }
            });

            console.log('Doctor available is updated to false.')
        }

        // Step 2: Create a new appointment
        const newAppointment = await prisma.Appointment.create({
        data: {
            hospitalId: hospitalId,
            doctorId: dId,
            patientId: uId, // Assuming uId is the patient's ID
            status: 'COMPLETED', // Set default status
        },
        });
        
        res.redirect('/user/appoinmentList');
    } catch (error) {
        console.error(error);
    }
}

async function appoinmentList (req, res) {
    try {
        const userData = req.userOne;
        const pk = userData.userId;

        const users = await prisma.Patient.findUnique({
            where: { id: parseInt(pk) }
        });

        const appoiment = await prisma.Appointment.findMany({
            where: { patientId: parseInt(pk) },
            include: {
                hospital: true,
                doctor: {
                    include: {
                        department: true // Include the doctor's department
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.render('user/appoinmentList', { data: users, appoiment });
    } catch (error) {
        console.error(error);
    }
}


module.exports = {
    login, register, registerUserData, userLoginProcess, dashboard, userLogout,
    appoinmentBook, appoinmentList,

};