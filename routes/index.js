var express = require('express');
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

require('dotenv').config();
const CODE = process.env.JSON_KEY;

const adminController = require('../controllers/adminController');
const hospitalController = require('../controllers/hospitalController');
const userController = require('../controllers/userController');
const doctorController = require('../controllers/doctorController');

const authAdmin = require('../middlewares/authAdmin');
const authUser = require('../middlewares/authUser');
const authHospital = require('../middlewares/authHospital');
const authDoctor = require('../middlewares/authDoctor');

var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  const userToken = req.cookies.userToken;

  if (userToken === undefined) {
    try {

      const dept = await prisma.Department.findMany({
        include: {
          hospital: true
        }
      });

      res.render('index', {  userActive: false, dept });
    } catch (error) {
      console.error(error);
    }
  } else {
    try {
      const user = jwt.verify(userToken, CODE);
      req.userOne = user;
      userData = req.userOne

      id = userData.userId;

      const dept = await prisma.Department.findMany({
        include: {
          hospital: true
        }
      });
  
      res.render('index', {  userActive: true, uId: parseInt(id), dept });
    } catch (error) {
      console.error(error);
    }
  }
  
});

//  search by the location and department
router.post('/search', async (req, res) => {
  const { place, department } = req.body;
  
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        AND: [
          {
            hospital: {
              place: { contains: place, mode: 'insensitive' }, // Search for hospital location
            }
          },
          {
            departmentId: Number(department) // Search by department ID
          },
          { isAvailable: true }
        ]
      },
      include: {
        hospital: true,   // Include related hospital data
        department: true, // Include related department data
        availableSlots: true
      }
    });

    res.json({ doctors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// admin
router.get('/admin/logout', adminController.adminLogout);
router.get('/admin/', adminController.adminLogin);
router.get('/admin/index',authAdmin, adminController.home);

router.post('/admin/login', adminController.adminLoginProcess);

// hospital
router.get('/hospital/', hospitalController.hospitalLogin);
router.get('/hospital/logout', hospitalController.hospitalLogout);
router.get('/hospital/register', hospitalController.hospitalReg);
router.get('/hospital/index', authHospital, hospitalController.home);
router.get('/hospital/addDepartment', authHospital, hospitalController.addDepartment);
router.get('/hospital/removeDept/:id', authHospital, hospitalController.removeDepartment);
router.get('/hospital/addDoc', authHospital, hospitalController.addDoc);
router.get('/hospital/removeDoc/:docId', authHospital, hospitalController.removeDoc);
router.get('/hospital/appoiments', authHospital, hospitalController.appoiments);

router.post('/hospital/register', hospitalController.hospitalRegData);
router.post('/hospital/login', hospitalController.hospitalLoginProcess);
router.post('/hospital/addDepartment', hospitalController.insertDepartment);
router.post('/hospital/addDoctor', hospitalController.insertaddDoctor);

// doctor
router.get('/doctor/', doctorController.login);
router.get('/doctor/logout', doctorController.doctorLogout);
router.get('/doctor/dashboard', authDoctor, doctorController.dashboard);
router.get('/doctor/appoinmentList', authDoctor, doctorController.appoinmentList);
router.get('/updateSlotzero/<%= data.id %>', authDoctor, doctorController.slotZero);

router.post('/doctor/login', doctorController.doctorLoginProcess);
router.post('/updateAvailability/:id', doctorController.updateAvailability);
router.post('/doctor/addSlots/:doctorId', doctorController.addSlots);

// patient
router.get('/user/login', userController.login);
router.get('/user/logout', userController.userLogout);
router.get('/user/register', userController.register);
router.get('/user/dashboard', authUser, userController.dashboard);
router.get('/user/appoinmentBook/:dId/:uId', authUser, userController.appoinmentBook);
router.get('/user/appoinmentList', authUser, userController.appoinmentList);

router.post('/user/register', userController.registerUserData);
router.post('/user/login', userController.userLoginProcess);



module.exports = router;
