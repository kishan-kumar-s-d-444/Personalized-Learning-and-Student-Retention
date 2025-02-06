const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const { db } = require('../config/db');

const studentRegister = async (req, res) => {
    try {
        const { name, rollNum, password, adminID, sclassName } = req.body;

        // Get MySQL IDs for admin and class
        const admin = await Admin.findById(adminID);
        if (!admin) {
            return res.status(404).send({ message: "Admin not found" });
        }

        const sclass = await Sclass.findById(sclassName);
        if (!sclass) {
            return res.status(404).send({ message: "Class not found" });
        }

        // Get MySQL admin_id and sclass_id
        const [mysqlAdmin] = await db.mysql.execute(
            'SELECT admin_id FROM admin WHERE email = ?',
            [admin.email]
        );

        const [mysqlClass] = await db.mysql.execute(
            'SELECT sclass_id FROM sclass WHERE sclass_name = ? AND admin_id = ?',
            [sclass.sclassName, mysqlAdmin[0].admin_id]
        );

        // Check for existing student in both databases
        const existingStudent = await Student.findOne({
            rollNum,
            school: adminID,
            sclassName
        });

        const [existingMySQLStudent] = await db.mysql.execute(
            'SELECT * FROM students WHERE roll_num = ? AND admin_id = ? AND sclass_id = ?',
            [rollNum, mysqlAdmin[0].admin_id, mysqlClass[0].sclass_id]
        );

        if (existingStudent || existingMySQLStudent.length > 0) {
            return res.status(400).send({ message: 'Roll Number already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // Create in MongoDB
        const student = new Student({
            name,
            rollNum,
            password: hashedPass,
            school: adminID,
            sclassName
        });

        const mongoResult = await student.save();

        // Create in MySQL
        const [mysqlResult] = await db.mysql.execute(
            'INSERT INTO students (name, roll_num, password, admin_id, sclass_id) VALUES (?, ?, ?, ?, ?)',
            [name, rollNum, hashedPass, mysqlAdmin[0].admin_id, mysqlClass[0].sclass_id]
        );

        // Send response without password
        const response = {
            ...mongoResult.toObject(),
            mysql_id: mysqlResult.insertId,
            password: undefined
        };

        res.status(201).send(response);

    } catch (err) {
        console.error('Student registration error:', err);
        res.status(500).json({
            message: 'Failed to register student',
            error: err.message
        });
    }
};

const studentLogIn = async (req, res) => {
    try {
        // Find student in MongoDB
        let student = await Student.findOne({ 
            rollNum: req.body.rollNum, 
            name: req.body.studentName 
        });

        if (!student) {
            return res.status(404).send({ message: "Student not found" });
        }

        // Get MySQL student data
        const [mysqlStudent] = await db.mysql.execute(
            `SELECT s.*, sc.sclass_name, a.school_name 
             FROM students s 
             JOIN sclass sc ON s.sclass_id = sc.sclass_id 
             JOIN admin a ON s.admin_id = a.admin_id 
             WHERE s.roll_num = ? AND s.name = ?`,
            [req.body.rollNum, req.body.studentName]
        );

        if (mysqlStudent.length === 0) {
            return res.status(404).send({ message: "Student not found" });
        }

        // Verify password
        const validated = await bcrypt.compare(req.body.password, student.password);
        if (!validated) {
            return res.status(401).send({ message: "Invalid password" });
        }

        // Populate MongoDB references
        student = await student.populate("school", "schoolName");
        student = await student.populate("sclassName", "sclassName");

        // Combine data and remove sensitive information
        const response = {
            ...student.toObject(),
            mysql_id: mysqlStudent[0].student_id,
            password: undefined,
            examResult: undefined,
            attendance: undefined
        };

        res.send(response);

    } catch (err) {
        console.error('Student login error:', err);
        res.status(500).json({
            message: 'Login failed',
            error: err.message
        });
    }
};

const getStudents = async (req, res) => {
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
        let mongoStudents = await Student.find({ school: req.params.id })
            .populate("sclassName", "sclassName");

        // Get from MySQL with joined data
        const [mysqlStudents] = await db.mysql.execute(
            `SELECT s.*, sc.sclass_name 
             FROM students s 
             JOIN sclass sc ON s.sclass_id = sc.sclass_id 
             WHERE s.admin_id = ?`,
            [mysqlAdmin[0].admin_id]
        );

        if (mongoStudents.length > 0) {
            // Combine data and remove sensitive information
            const students = mongoStudents.map(student => {
                const mysqlStudent = mysqlStudents.find(ms => 
                    ms.roll_num === student.rollNum && 
                    ms.name === student.name
                );
                return {
                    ...student.toObject(),
                    mysql_id: mysqlStudent?.student_id,
                    password: undefined
                };
            });
            res.send(students);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json(err);
    }
};

const getStudentDetail = async (req, res) => {
    try {
        // Get from MongoDB with populated fields
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName", "subName")
            .populate("attendance.subName", "subName sessions");

        if (!student) {
            return res.send({ message: "No student found" });
        }

        // Get from MySQL with joined data
        const [mysqlStudent] = await db.mysql.execute(
            `SELECT s.*, sc.sclass_name, a.school_name,
                    GROUP_CONCAT(DISTINCT er.marks_obtained) as exam_results,
                    GROUP_CONCAT(DISTINCT sa.status) as attendance_status
             FROM students s 
             JOIN sclass sc ON s.sclass_id = sc.sclass_id 
             JOIN admin a ON s.admin_id = a.admin_id 
             LEFT JOIN exam_results er ON s.student_id = er.student_id
             LEFT JOIN student_attendance sa ON s.student_id = sa.student_id
             WHERE s.roll_num = ? AND s.name = ?
             GROUP BY s.student_id`,
            [student.rollNum, student.name]
        );

        // Combine data and remove sensitive information
        const response = {
            ...student.toObject(),
            mysql_id: mysqlStudent[0]?.student_id,
            password: undefined
        };

        res.send(response);
    } catch (err) {
        console.error('Error fetching student details:', err);
        res.status(500).json(err);
    }
};

const deleteStudent = async (req, res) => {
    try {
        // Get student details
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).send({ message: "Student not found" });
        }

        // Delete from MongoDB
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);

        // Delete from MySQL (will cascade delete attendance and exam results)
        await db.mysql.execute(
            'DELETE FROM students WHERE roll_num = ? AND name = ?',
            [student.rollNum, student.name]
        );

        res.send(deletedStudent);
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json(error);
    }
};

const deleteStudents = async (req, res) => {
    try {
        // Get admin details for MySQL
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).send({ message: "Admin not found" });
        }

        // Get MySQL admin_id
        const [mysqlAdmin] = await db.mysql.execute(
            'SELECT admin_id FROM admin WHERE email = ?',
            [admin.email]
        );

        // Delete from MongoDB
        const deletedStudents = await Student.deleteMany({ school: req.params.id });

        // Delete from MySQL (will cascade delete attendance and exam results)
        await db.mysql.execute(
            'DELETE FROM students WHERE admin_id = ?',
            [mysqlAdmin[0].admin_id]
        );

        res.send(deletedStudents);
    } catch (error) {
        console.error('Error deleting students:', error);
        res.status(500).json(error);
    }
};

const deleteStudentsByClass = async (req, res) => {
    try {
        // Get class details
        const sclass = await Sclass.findById(req.params.id);
        if (!sclass) {
            return res.status(404).send({ message: "Class not found" });
        }

        // Get MySQL class_id
        const [mysqlClass] = await db.mysql.execute(
            'SELECT sclass_id FROM sclass WHERE sclass_name = ? AND admin_id = (SELECT admin_id FROM admin WHERE email = ?)',
            [sclass.sclassName, (await Admin.findById(sclass.school)).email]
        );

        // Delete from MongoDB
        const deletedStudents = await Student.deleteMany({ sclassName: req.params.id });

        // Delete from MySQL (will cascade delete attendance and exam results)
        await db.mysql.execute(
            'DELETE FROM students WHERE sclass_id = ?',
            [mysqlClass[0].sclass_id]
        );

        res.send(deletedStudents);
    } catch (error) {
        console.error('Error deleting students by class:', error);
        res.status(500).json(error);
    }
};

const updateStudent = async (req, res) => {
    try {
        // Get existing student details
        const existingStudent = await Student.findById(req.params.id);
        if (!existingStudent) {
            return res.status(404).send({ message: "Student not found" });
        }

        // Get MySQL student_id
        const [mysqlStudent] = await db.mysql.execute(
            'SELECT student_id FROM students WHERE roll_num = ? AND name = ?',
            [existingStudent.rollNum, existingStudent.name]
        );

        // Prepare update data
        const updateData = { ...req.body };

        // Handle password update if provided
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        // If class is being updated, get new MySQL class_id
        let mysqlClassId = null;
        if (updateData.sclassName) {
            const newClass = await Sclass.findById(updateData.sclassName);
            const [mysqlClass] = await db.mysql.execute(
                'SELECT sclass_id FROM sclass WHERE sclass_name = ? AND admin_id = (SELECT admin_id FROM admin WHERE email = ?)',
                [newClass.sclassName, (await Admin.findById(existingStudent.school)).email]
            );
            mysqlClassId = mysqlClass[0].sclass_id;
        }

        // Update in MongoDB
        const mongoResult = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        // Prepare MySQL update query parts
        const mysqlUpdates = [];
        const mysqlValues = [];

        if (updateData.name) {
            mysqlUpdates.push('name = ?');
            mysqlValues.push(updateData.name);
        }
        if (updateData.rollNum) {
            mysqlUpdates.push('roll_num = ?');
            mysqlValues.push(updateData.rollNum);
        }
        if (updateData.password) {
            mysqlUpdates.push('password = ?');
            mysqlValues.push(updateData.password);
        }
        if (mysqlClassId) {
            mysqlUpdates.push('sclass_id = ?');
            mysqlValues.push(mysqlClassId);
        }

        // Update in MySQL if there are changes
        if (mysqlUpdates.length > 0) {
            mysqlValues.push(mysqlStudent[0].student_id); // Add WHERE clause value
            await db.mysql.execute(
                `UPDATE students SET ${mysqlUpdates.join(', ')} WHERE student_id = ?`,
                mysqlValues
            );
        }

        // Remove sensitive data before sending response
        const response = mongoResult.toObject();
        response.password = undefined;
        response.mysql_id = mysqlStudent[0].student_id;

        res.send(response);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            message: 'Failed to update student',
            error: error.message
        });
    }
};

const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;

    try {
        // Get student and subject details
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }

        const subject = await Subject.findById(subName);
        if (!subject) {
            return res.status(404).send({ message: 'Subject not found' });
        }

        // Get MySQL IDs
        const [mysqlStudent] = await db.mysql.execute(
            'SELECT student_id FROM students WHERE roll_num = ? AND name = ?',
            [student.rollNum, student.name]
        );

        const [mysqlSubject] = await db.mysql.execute(
            'SELECT subject_id FROM subjects WHERE sub_code = ?',
            [subject.subCode]
        );

        // Update in MongoDB
        const existingResult = student.examResult.find(
            (result) => result.subName.toString() === subName
        );

        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        } else {
            student.examResult.push({ subName, marksObtained });
        }

        const mongoResult = await student.save();

        // Update in MySQL
        await db.mysql.execute(
            `INSERT INTO exam_results (student_id, subject_id, marks_obtained) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE marks_obtained = ?`,
            [
                mysqlStudent[0].student_id,
                mysqlSubject[0].subject_id,
                marksObtained,
                marksObtained
            ]
        );

        res.send(mongoResult);
    } catch (error) {
        console.error('Error updating exam result:', error);
        res.status(500).json(error);
    }
};

const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;

    try {
        // Get student and subject details
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }

        const subject = await Subject.findById(subName);
        if (!subject) {
            return res.status(404).send({ message: 'Subject not found' });
        }

        // Get MySQL IDs
        const [mysqlStudent] = await db.mysql.execute(
            'SELECT student_id FROM students WHERE roll_num = ? AND name = ?',
            [student.rollNum, student.name]
        );

        const [mysqlSubject] = await db.mysql.execute(
            'SELECT subject_id FROM subjects WHERE sub_code = ?',
            [subject.subCode]
        );

        // Check attendance in MongoDB
        const existingAttendance = student.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString() &&
                a.subName.toString() === subName
        );

        // Update MongoDB
        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            const attendedSessions = student.attendance.filter(
                (a) => a.subName.toString() === subName
            ).length;

            if (attendedSessions >= subject.sessions) {
                return res.send({ message: 'Maximum attendance limit reached' });
            }

            student.attendance.push({ date, status, subName });
        }

        const mongoResult = await student.save();

        // Update MySQL
        await db.mysql.execute(
            `INSERT INTO student_attendance (student_id, subject_id, date, status) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE status = ?`,
            [
                mysqlStudent[0].student_id,
                mysqlSubject[0].subject_id,
                new Date(date),
                status,
                status
            ]
        );

        res.send(mongoResult);
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;

    try {
        // Get subject details for MySQL
        const subject = await Subject.findById(subName);
        if (!subject) {
            return res.status(404).send({ message: 'Subject not found' });
        }

        // Get MySQL subject_id
        const [mysqlSubject] = await db.mysql.execute(
            'SELECT subject_id FROM subjects WHERE sub_code = ?',
            [subject.subCode]
        );

        // Clear in MongoDB
        const mongoResult = await Student.updateMany(
            { 'attendance.subName': subName },
            { $pull: { attendance: { subName } } }
        );

        // Clear in MySQL
        await db.mysql.execute(
            'DELETE FROM student_attendance WHERE subject_id = ?',
            [mysqlSubject[0].subject_id]
        );

        return res.send(mongoResult);
    } catch (error) {
        console.error('Error clearing attendance:', error);
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    const schoolId = req.params.id;

    try {
        // Get admin details for MySQL
        const admin = await Admin.findById(schoolId);
        if (!admin) {
            return res.status(404).send({ message: "Admin not found" });
        }

        // Get MySQL admin_id
        const [mysqlAdmin] = await db.mysql.execute(
            'SELECT admin_id FROM admin WHERE email = ?',
            [admin.email]
        );

        // Clear in MongoDB
        const mongoResult = await Student.updateMany(
            { school: schoolId },
            { $set: { attendance: [] } }
        );

        // Clear in MySQL
        await db.mysql.execute(
            `DELETE sa FROM student_attendance sa 
             INNER JOIN students s ON sa.student_id = s.student_id 
             WHERE s.admin_id = ?`,
            [mysqlAdmin[0].admin_id]
        );

        return res.send(mongoResult);
    } catch (error) {
        console.error('Error clearing all attendance:', error);
        res.status(500).json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId;

    try {
        // Get student and subject details
        const student = await Student.findById(studentId);
        const subject = await Subject.findById(subName);

        if (!student || !subject) {
            return res.status(404).send({ message: 'Student or subject not found' });
        }

        // Get MySQL IDs
        const [mysqlStudent] = await db.mysql.execute(
            'SELECT student_id FROM students WHERE roll_num = ? AND name = ?',
            [student.rollNum, student.name]
        );

        const [mysqlSubject] = await db.mysql.execute(
            'SELECT subject_id FROM subjects WHERE sub_code = ?',
            [subject.subCode]
        );

        // Remove in MongoDB
        const mongoResult = await Student.updateOne(
            { _id: studentId },
            { $pull: { attendance: { subName: subName } } }
        );

        // Remove in MySQL
        await db.mysql.execute(
            'DELETE FROM student_attendance WHERE student_id = ? AND subject_id = ?',
            [mysqlStudent[0].student_id, mysqlSubject[0].subject_id]
        );

        return res.send(mongoResult);
    } catch (error) {
        console.error('Error removing student attendance:', error);
        res.status(500).json(error);
    }
};

const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id;

    try {
        // Get student details
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }

        // Get MySQL student_id
        const [mysqlStudent] = await db.mysql.execute(
            'SELECT student_id FROM students WHERE roll_num = ? AND name = ?',
            [student.rollNum, student.name]
        );

        // Clear in MongoDB
        const mongoResult = await Student.updateOne(
            { _id: studentId },
            { $set: { attendance: [] } }
        );

        // Clear in MySQL
        await db.mysql.execute(
            'DELETE FROM student_attendance WHERE student_id = ?',
            [mysqlStudent[0].student_id]
        );

        return res.send(mongoResult);
    } catch (error) {
        console.error('Error removing student attendance:', error);
        res.status(500).json(error);
    }
};


module.exports = {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
};