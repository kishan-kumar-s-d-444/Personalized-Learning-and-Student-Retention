const router = require('express').Router();
const axios = require('axios');
const { adminRegister, adminLogIn, getAdminDetail, getAllAdmins} = require('../controllers/admin-controller.js');
const { 
    sclassCreate, 
    sclassList, 
    deleteSclass, 
    deleteSclasses, 
    getSclassDetail, 
    getSclassStudents,
    getClassTeachers
} = require('../controllers/class-controller.js');
const { complainCreate, complainList } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const {studentRegister,studentLogIn,getStudents,getStudentDetail,deleteStudents,deleteStudent,updateStudent,studentAttendance,deleteStudentsByClass,updateExamResult,clearAllStudentsAttendanceBySubject,clearAllStudentsAttendance,removeStudentAttendanceBySubject,
    removeStudentAttendance } = require('../controllers/student_controller.js');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const { teacherRegister, teacherLogIn, getTeachers, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, teacherAttendance } = require('../controllers/teacher-controller.js');

const multer = require('multer');
const { uploadMaterial, getMaterials, deleteMaterial} = require('../controllers/materialcontroller');
const upload = multer({ dest: 'uploads/' });
router.post('/materials/upload', upload.single('file'), uploadMaterial);
router.get('/materials/:sclassId', getMaterials);
router.delete('/materials/:id', deleteMaterial);


const { createDoubt, getDoubts, getConversation } = require("../controllers/doubt-controller");

router.post("/doubt/add", createDoubt); // Add a doubt
router.get("/doubt/get", getDoubts);    // Get all doubts
router.get("/doubt/conversation/:senderId/:receiverId", getConversation); // Get conversation between two users

router.post('/create-doubt', createDoubt);
router.get('/get-doubts', getDoubts);
router.get('/conversation/:senderId/:receiverId', getConversation);

// Admin
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);
router.get("/Admin/:id", getAdminDetail)
router.get("/Admin", getAllAdmins);

// Student
router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn)
router.get("/Students/:id", getStudents)
router.get("/Student/:id", getStudentDetail)
router.delete("/Students/:id", deleteStudents)
router.delete("/StudentsClass/:id", deleteStudentsByClass)
router.delete("/Student/:id", deleteStudent)
router.put("/Student/:id", updateStudent)
router.put('/UpdateExamResult/:id', updateExamResult)
router.put('/StudentAttendance/:id', studentAttendance)
router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);
router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance)

// Teacher
router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn)
router.get("/Teachers/:id", getTeachers)
router.get("/Teacher/:id", getTeacherDetail)
router.delete("/Teachers/:id", deleteTeachers)
router.delete("/TeachersClass/:id", deleteTeachersByClass)
router.delete("/Teacher/:id", deleteTeacher)
router.put("/TeacherSubject", updateTeacherSubject)
router.post('/TeacherAttendance/:id', teacherAttendance)

// Notice
router.post('/NoticeCreate', noticeCreate);
router.get('/NoticeList/:id', noticeList);
router.delete("/Notices/:id", deleteNotices)
router.delete("/Notice/:id", deleteNotice)
router.put("/Notice/:id", updateNotice)

// Complain
router.post('/ComplainCreate', complainCreate);
router.get('/ComplainList/:id', complainList);

// Sclass
router.post('/SclassCreate', sclassCreate);
router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail)
router.get("/Sclass/Students/:id", getSclassStudents)
router.get("/Sclass/Teachers/:id", getClassTeachers)
router.delete("/Sclasses/:id", deleteSclasses)
router.delete("/Sclass/:id", deleteSclass)

// Subject
router.post('/SubjectCreate', subjectCreate);
router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail)
router.delete("/Subject/:id", deleteSubject)
router.delete("/Subjects/:id", deleteSubjects)
router.delete("/SubjectsClass/:id", deleteSubjectsByClass)



router.get('/api/query', async (req, res) => {
    const query = req.query.q;
    const appId = 'YT969R-L5VETUT93G';
  
    console.log(`Received query: ${query}`); // Logging the received query
  
    try {
      const response = await axios.get(`https://api.wolframalpha.com/v1/result?i=${query}&appid=${appId}`);
      res.send(response.data);
    } catch (error) {
      console.error('Error fetching the result:', error.message); // Logging the error message
      res.status(500).send('Error fetching the result');
    }
  });

module.exports = router;