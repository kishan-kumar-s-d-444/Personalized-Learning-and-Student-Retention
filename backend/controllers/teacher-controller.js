const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const { db } = require('../config/db');
const jwt = require('jsonwebtoken');

const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass } = req.body;
    try {
        // Validate input fields
        if (!name || !email || !password) {
            return res.status(400).send({ message: 'Name, email, and password are required' });
        }

        // Get MySQL IDs for admin, subject, and class
        const admin = await Admin.findById(school);
        if (!admin) {
            return res.status(404).send({ message: "School not found" });
        }

        const [mysqlAdmin] = await db.mysql.execute(
            'SELECT admin_id FROM admin WHERE email = ?',
            [admin.email]
        );

        if (mysqlAdmin.length === 0) {
            return res.status(404).send({ message: "Admin not found in MySQL database" });
        }

        // Check for existing teacher
        const existingTeacherByEmail = await Teacher.findOne({ email });
        const [existingMySQLTeacher] = await db.mysql.execute(
            'SELECT * FROM teachers WHERE email = ?',
            [email]
        );

        if (existingTeacherByEmail || existingMySQLTeacher.length > 0) {
            return res.status(400).send({ message: 'Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // Prepare MySQL IDs
        let mysqlSubjectId = null;
        let mysqlClassId = null;

        // Get MySQL subject_id if teachSubject is provided
        if (teachSubject) {
            const subject = await Subject.findById(teachSubject);
            if (!subject) {
                return res.status(404).send({ message: "Subject not found" });
            }

            const [mysqlSubject] = await db.mysql.execute(
                'SELECT subject_id FROM subjects WHERE sub_code = ? AND admin_id = ?',
                [subject.subCode, mysqlAdmin[0].admin_id]
            );

            if (mysqlSubject.length === 0) {
                return res.status(404).send({ message: "Subject not found in MySQL database" });
            }

            mysqlSubjectId = mysqlSubject[0].subject_id;
        }

        // Get MySQL class_id
        if (teachSclass) {
            const sclass = await Sclass.findById(teachSclass);
            if (!sclass) {
                return res.status(404).send({ message: "Class not found" });
            }

            const [mysqlClass] = await db.mysql.execute(
                'SELECT sclass_id FROM sclass WHERE sclass_name = ? AND admin_id = ?',
                [sclass.sclassName, mysqlAdmin[0].admin_id]
            );

            if (mysqlClass.length === 0) {
                return res.status(404).send({ message: "Class not found in MySQL database" });
            }

            mysqlClassId = mysqlClass[0].sclass_id;
        }

        // Create teacher in MongoDB
        const teacher = new Teacher({
            name,
            email,
            password: hashedPass,
            role,
            school,
            teachSubject,
            teachSclass
        });

        const mongoResult = await teacher.save();

        // Create teacher in MySQL
        const [mysqlResult] = await db.mysql.execute(
            'INSERT INTO teachers (name, email, password, role, admin_id, subject_id, sclass_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                name,
                email,
                hashedPass,
                role || 'Teacher',
                mysqlAdmin[0].admin_id,
                mysqlSubjectId,
                mysqlClassId
            ]
        );

        // Update subject with teacher reference if needed
        if (teachSubject) {
            await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
            await db.mysql.execute(
                'UPDATE subjects SET teacher_id = ? WHERE subject_id = ?',
                [mysqlResult.insertId, mysqlSubjectId]
            );
        }

        // Send response without password
        const response = {
            ...mongoResult.toObject(),
            mysql_id: mysqlResult.insertId,
            password: undefined
        };

        res.status(201).send(response);

    } catch (err) {
        console.error('Teacher Registration Error:', err);
        res.status(500).send({ 
            message: 'Internal server error during teacher registration',
            error: err.message 
        });
    }
};

const teacherLogIn = async (req, res) => {
    try {
        // Find teacher in MongoDB
        let teacher = await Teacher.findOne({ email: req.body.email });
        
        if (!teacher) {
            return res.status(404).send({ message: "Teacher not found" });
        }

        // Verify password
        const validated = await bcrypt.compare(req.body.password, teacher.password);
        if (!validated) {
            return res.status(401).send({ message: "Invalid password" });
        }

        // Populate MongoDB references
        teacher = await teacher.populate("teachSubject", "subName sessions");
        teacher = await teacher.populate("school", "schoolName");
        teacher = await teacher.populate("teachSclass", "sclassName");

        // Generate JWT token
        const token = jwt.sign(
            { _id: teacher._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Remove sensitive data
        const teacherData = teacher.toObject();
        delete teacherData.password;

        // Send response
        res.status(200).json({
            ...teacherData,
            token
        });

    } catch (error) {
        console.error('Teacher login error:', error);
        res.status(500).json({
            message: 'Login failed',
            error: error.message
        });
    }
};

const getTeachers = async (req, res) => {
    try {
        // Get admin details for MySQL query
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).send({ message: "Admin not found" });
        }

        // Get MySQL admin_id
        const [mysqlAdmin] = await db.mysql.execute(
            'SELECT admin_id FROM admin WHERE email = ?',
            [admin.email]
        );

        // Get from MongoDB with populated fields
        let mongoTeachers = await Teacher.find({ school: req.params.id })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");

        // Get from MySQL with joined data
        const [mysqlTeachers] = await db.mysql.execute(
            `SELECT t.*, s.sub_name, sc.sclass_name 
             FROM teachers t 
             LEFT JOIN subjects s ON t.subject_id = s.subject_id 
             LEFT JOIN sclass sc ON t.sclass_id = sc.sclass_id 
             WHERE t.admin_id = ?`,
            [mysqlAdmin[0].admin_id]
        );

        if (mongoTeachers.length > 0) {
            // Combine data and remove sensitive information
            const teachers = mongoTeachers.map(teacher => {
                const mysqlTeacher = mysqlTeachers.find(mt => mt.email === teacher.email);
                return {
                    ...teacher.toObject(),
                    mysql_id: mysqlTeacher?.teacher_id,
                    password: undefined
                };
            });
            res.send(teachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        console.error('Error fetching teachers:', err);
        res.status(500).json(err);
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        // Get from MongoDB with populated fields
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName");

        if (!teacher) {
            return res.send({ message: "No teacher found" });
        }

        // Get from MySQL with joined data
        const [mysqlTeacher] = await db.mysql.execute(
            `SELECT t.*, s.sub_name, s.sessions, sc.sclass_name, a.school_name 
             FROM teachers t 
             LEFT JOIN subjects s ON t.subject_id = s.subject_id 
             LEFT JOIN sclass sc ON t.sclass_id = sc.sclass_id 
             LEFT JOIN admin a ON t.admin_id = a.admin_id 
             WHERE t.email = ?`,
            [teacher.email]
        );

        // Combine data and remove sensitive information
        const response = {
            ...teacher.toObject(),
            mysql_id: mysqlTeacher[0]?.teacher_id,
            password: undefined
        };

        res.send(response);
    } catch (err) {
        console.error('Error fetching teacher details:', err);
        res.status(500).json(err);
    }
};

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        // Update in MongoDB
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { teachSubject },
            { new: true }
        );

        // Get MySQL IDs
        const subject = await Subject.findById(teachSubject);
        const [mysqlSubject] = await db.mysql.execute(
            'SELECT subject_id FROM subjects WHERE sub_code = ?',
            [subject.subCode]
        );

        // Update in MySQL
        await db.mysql.execute(
            'UPDATE teachers SET subject_id = ? WHERE email = ?',
            [mysqlSubject[0].subject_id, updatedTeacher.email]
        );

        // Update subject references
        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });
        await db.mysql.execute(
            'UPDATE subjects SET teacher_id = (SELECT teacher_id FROM teachers WHERE email = ?) WHERE subject_id = ?',
            [updatedTeacher.email, mysqlSubject[0].subject_id]
        );

        res.send(updatedTeacher);
    } catch (error) {
        console.error('Error updating teacher subject:', error);
        res.status(500).json(error);
    }
};

const deleteTeacher = async (req, res) => {
    try {
        // Get teacher details from MongoDB
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).send({ message: "Teacher not found" });
        }

        // Delete from MongoDB
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        // Delete from MySQL
        await db.mysql.execute(
            'DELETE FROM teachers WHERE email = ?',
            [teacher.email]
        );

        // Update subject references in MongoDB
        await Subject.updateOne(
            { teacher: deletedTeacher._id },
            { $unset: { teacher: 1 } }
        );

        // Update subject references in MySQL
        await db.mysql.execute(
            'UPDATE subjects SET teacher_id = NULL WHERE teacher_id = (SELECT teacher_id FROM teachers WHERE email = ?)',
            [teacher.email]
        );

        res.send(deletedTeacher);
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json(error);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ school: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ school: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ sclassName: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date } = req.body;

    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        // Get MySQL teacher_id
        const [mysqlTeacher] = await db.mysql.execute(
            'SELECT teacher_id FROM teachers WHERE email = ?',
            [teacher.email]
        );

        // Update/Create attendance in MongoDB
        const existingAttendance = teacher.attendance.find(
            (a) => a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            teacher.attendance.push({ date, status });
        }

        const mongoResult = await teacher.save();

        // Update/Create attendance in MySQL
        await db.mysql.execute(
            `INSERT INTO teacher_attendance (teacher_id, date, status) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE status = ?`,
            [mysqlTeacher[0].teacher_id, new Date(date), status, status]
        );

        return res.send(mongoResult);
    } catch (error) {
        console.error('Error updating teacher attendance:', error);
        res.status(500).json(error);
    }
};

module.exports = {
    teacherRegister,
    teacherLogIn,
    getTeachers,
    getTeacherDetail,
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance
};
