const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

require('dotenv').config();
const CODE = process.env.JSON_KEY;

async function hospitalLogin (req, res) {
    res.render('hospital/login');
}

async function hospitalReg (req, res) {
    try {
        res.render('hospital/register',);
    } catch (error) {
        console.error(error);
    }
}

async function hospitalRegData (req, res) {
    try {
        const { name, phone, email, place, password } = req.body;
        const addHosData = await prisma.Hospital.create({
            data: {
                name: name,
                email: email,
                phone: phone,
                place: place,
                password: password
            }
        });

        console.log('Hospital is added');
        res.redirect('/hospital/');
    } catch (error) {
        console.error(error);
    }
}

async function home(req, res) {
    try {
        const hosData = req.hospital;
        const pk = hosData.hospitalId;
        
        const hos = await prisma.Hospital.findUnique({
            where: { id: pk }
        });

        // Fetch total count of doctors, departments, and appointments
        const totalDoctors = await prisma.Doctor.count({
            where: { hospitalId: pk }
        });

        const totalDepartments = await prisma.Department.count({
            where: { hospitalId: pk }
        });

        const totalAppointments = await prisma.Appointment.count({
            where: { hospitalId: pk }
        });

        res.render('hospital/index', { data: hos,
            totalDoctors, totalDepartments, totalAppointments,
        });
    } catch (error) {
        console.error(error);
    }
}

async function addDepartment(req, res) {
    try {
        const hosData = req.hospital;
        const pk = hosData.hospitalId;
        
        const hos = await prisma.Hospital.findUnique({
            where: { id: pk }
        });

        const dept = await prisma.department.findMany({
            where: {
                hospitalId: pk
            },
            include: {
                doctors: true, // This will include associated doctors if needed
                hospital: true // This will include the hospital details
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.                                                                                                                                                                                                                                                                                                                                                ('hospital/addDepartment', { data: hos, dept })
    } catch (error) {
        console.error(error);
    }
}

async function insertDepartment(req, res) {
    try {
        const { name, hosId } = req.body;
        
        const hos = await prisma.Department.create({
            data: { 
                name: name,
                hospitalId: parseInt(hosId),
            }
        });
        console.log('Department is added');
        
        res.redirect('/hospital/addDepartment');
    } catch (error) {
        console.error(error);
    }
}

async function removeDepartment(req, res) {
    try {
        const { id } = req.params;
        
        const hos = await prisma.Department.delete({
            where: { id: parseInt(id) }
        });
        console.log('Department is removed');
        
        res.redirect('/hospital/addDepartment');
    } catch (error) {
        console.error(error);
    }
}

async function addDoc(req, res) {
    try {
        const hosData = req.hospital;
        const pk = hosData.hospitalId;
        
        const hos = await prisma.Hospital.findUnique({
            where: { id: pk }
        });

        const dept = await prisma.department.findMany({
            where: {
                hospitalId: pk
            },
            include: {
                doctors: true, 
                hospital: true 
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const doctorlist = await prisma.Doctor.findMany({
            where: {
                hospitalId: pk
            },
            include: {
                department: true, 
            },
        });

        res.render('hospital/addDoc', { data: hos, dept, doctorlist, });
    } catch (error) {
        console.error(error);
    }
}

async function insertaddDoctor(req, res) {
    try {
        const { name, email, mobile, password, explvl, dept, hosId } = req.body;

        const addDoctor = await prisma.doctor.create({
            data: {
                name: name,
                email: email,
                phone: mobile,
                password: password,
                experience: explvl,         // Experience level like JUNIOR
                hospitalId: parseInt(hosId), // Existing hospital ID
                departmentId: parseInt(dept), // Existing department ID
            }
        });

        console.log('Doctor is added');
        res.redirect('/hospital/addDoc');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding doctor');
    }
}

async function removeDoc(req, res) {
    try {
        const docId = parseInt(req.params.docId);

        const removeDoctor = await prisma.Doctor.delete({
            where: {
                id: docId,
            }
        });

        console.log('Doctor is removed');

        res.redirect('/hospital/addDoc');
    } catch (error) {
        console.error(error);
    }
}

async function appoiments(req, res) {
    try {
        const hosData = req.hospital;
        const pk = hosData.hospitalId;
        
        const hos = await prisma.Hospital.findUnique({
            where: { id: pk }
        });

        const appoiment = await prisma.Appointment.findMany({
            where: { hospitalId: parseInt(pk) },
            include: {
                hospital: true,
                doctor: {
                    include: {
                        department: true 
                    }
                },
                patient: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        res.render('hospital/appoinmentList', { data: hos, appoiment });
    } catch (error) {
        console.error(error);
    }
}



// handle emp login requests
async function hospitalLoginProcess (req, res) {
    try {
        const { email, password } = req.body;
        
        const hos = await prisma.Hospital.findUnique({
            where: {
                email: email
            }
        });

        if (!hos) {
            return res.status(404).json({ message: "Hospital not found"});
        }

        let isPassVaild = false;

        if ((hos.password) === password) {
            isPassVaild = true;
        }

        if (!isPassVaild) {
            return res.status(401).json({message: "Invaild password"})
        }

        const token = jwt.sign({ hospitalId: hos.id }, CODE, { expiresIn: '1h' });

        res.cookie("hospitalToken", token, { httpOnly: true });

        res.redirect('/hospital/index');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
}

async function hospitalLogout (req, res) {  
    res.clearCookie('hospitalToken');
    return res.redirect('/hospital/');
}


module.exports = {
    hospitalLogin, hospitalReg, hospitalRegData,
    hospitalLoginProcess, hospitalLogout,
    home, addDepartment, insertDepartment, removeDepartment,
    addDoc, insertaddDoctor, removeDoc,
    appoiments, 
}