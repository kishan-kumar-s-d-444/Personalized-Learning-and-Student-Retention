const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const { db } = require('../config/db');

const subjectCreate = async (req, res) => {
    try {
        const subjects = req.body.subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
        }));

        // Get MySQL IDs for admin and sclass
        const admin = await Admin.findById(req.body.adminID);
        if (!admin) {
            return res.status(404).send({ message: "Admin not found" });
        }

        const sclass = await Sclass.findById(req.body.sclassName);
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

        // Check for existing subject in both databases
        const existingSubjectBySubCode = await Subject.findOne({
            'subCode': subjects[0].subCode,
            'school': req.body.adminID,
        });

        const [existingMySQLSubject] = await db.mysql.execute(
            'SELECT * FROM subjects WHERE sub_code = ? AND admin_id = ?',
            [subjects[0].subCode, mysqlAdmin[0].admin_id]
        );

        if (existingSubjectBySubCode || existingMySQLSubject.length > 0) {
            return res.send({ message: 'Sorry this subcode must be unique as it already exists' });
        }

        // Prepare subjects for MongoDB
        const newMongoSubjects = subjects.map((subject) => ({
            ...subject,
            sclassName: req.body.sclassName,
            school: req.body.adminID,
        }));

        // Insert into MongoDB
        const mongoResults = await Subject.insertMany(newMongoSubjects);

        // Insert into MySQL
        const mysqlValues = subjects.map(subject => [
            subject.subName,
            subject.subCode,
            subject.sessions,
            mysqlClass[0].sclass_id,
            mysqlAdmin[0].admin_id
        ]);

        const mysqlQuery = 'INSERT INTO subjects (sub_name, sub_code, sessions, sclass_id, admin_id) VALUES ?';
        await db.mysql.query(mysqlQuery, [mysqlValues]);

        res.send(mongoResults);
    } catch (err) {
        console.error('Error creating subjects:', err);
        res.status(500).json({ message: 'Failed to create subjects', error: err.message });
    }
};

const allSubjects = async (req, res) => {
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

        // Get from MongoDB
        let mongoSubjects = await Subject.find({ school: req.params.id })
            .populate("sclassName", "sclassName");

        // Get from MySQL
        const [mysqlSubjects] = await db.mysql.execute(
            'SELECT s.*, sc.sclass_name FROM subjects s JOIN sclass sc ON s.sclass_id = sc.sclass_id WHERE s.admin_id = ?',
            [mysqlAdmin[0].admin_id]
        );

        if (mongoSubjects.length > 0) {
            // Combine data if needed
            const subjects = mongoSubjects.map(mongoSubject => {
                const mysqlSubject = mysqlSubjects.find(ms => 
                    ms.sub_code === mongoSubject.subCode && 
                    ms.sclass_name === mongoSubject.sclassName.sclassName
                );
                return {
                    ...mongoSubject.toObject(),
                    mysql_id: mysqlSubject ? mysqlSubject.subject_id : null
                };
            });
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        console.error('Error fetching subjects:', err);
        res.status(500).json({ message: 'Failed to fetch subjects', error: err.message });
    }
};

const classSubjects = async (req, res) => {
    try {
        // Get class details
        const sclass = await Sclass.findById(req.params.id);
        if (!sclass) {
            return res.status(404).send({ message: "Class not found" });
        }

        // Get MySQL IDs
        const admin = await Admin.findById(sclass.school);
        const [mysqlAdmin] = await db.mysql.execute(
            'SELECT admin_id FROM admin WHERE email = ?',
            [admin.email]
        );

        const [mysqlClass] = await db.mysql.execute(
            'SELECT sclass_id FROM sclass WHERE sclass_name = ? AND admin_id = ?',
            [sclass.sclassName, mysqlAdmin[0].admin_id]
        );

        // Get from MongoDB
        const mongoSubjects = await Subject.find({ sclassName: req.params.id });

        // Get from MySQL
        const [mysqlSubjects] = await db.mysql.execute(
            'SELECT * FROM subjects WHERE sclass_id = ?',
            [mysqlClass[0].sclass_id]
        );

        if (mongoSubjects.length > 0) {
            // Combine data if needed
            const subjects = mongoSubjects.map(mongoSubject => {
                const mysqlSubject = mysqlSubjects.find(ms => ms.sub_code === mongoSubject.subCode);
                return {
                    ...mongoSubject.toObject(),
                    mysql_id: mysqlSubject ? mysqlSubject.subject_id : null
                };
            });
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        console.error('Error fetching class subjects:', err);
        res.status(500).json({ message: 'Failed to fetch subjects', error: err.message });
    }
};

const freeSubjectList = async (req, res) => {
    try {
        // Get from MongoDB
        const mongoSubjects = await Subject.find({ 
            sclassName: req.params.id, 
            teacher: { $exists: false } 
        });

        if (mongoSubjects.length > 0) {
            // Get MySQL data for these subjects
            const sclass = await Sclass.findById(req.params.id);
            const admin = await Admin.findById(sclass.school);
            
            const [mysqlClass] = await db.mysql.execute(
                'SELECT sclass_id FROM sclass WHERE sclass_name = ? AND admin_id = (SELECT admin_id FROM admin WHERE email = ?)',
                [sclass.sclassName, admin.email]
            );

            const [mysqlSubjects] = await db.mysql.execute(
                'SELECT * FROM subjects WHERE sclass_id = ? AND teacher_id IS NULL',
                [mysqlClass[0].sclass_id]
            );

            // Combine data
            const subjects = mongoSubjects.map(mongoSubject => {
                const mysqlSubject = mysqlSubjects.find(ms => ms.sub_code === mongoSubject.subCode);
                return {
                    ...mongoSubject.toObject(),
                    mysql_id: mysqlSubject ? mysqlSubject.subject_id : null
                };
            });
            res.send(subjects);
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        console.error('Error fetching free subjects:', err);
        res.status(500).json({ message: 'Failed to fetch subjects', error: err.message });
    }
};

const getSubjectDetail = async (req, res) => {
    try {
        // Get from MongoDB
        let subject = await Subject.findById(req.params.id)
            .populate("sclassName", "sclassName")
            .populate("teacher", "name");

        if (!subject) {
            return res.send({ message: "No subject found" });
        }

        // Get MySQL data
        const [mysqlSubject] = await db.mysql.execute(
            `SELECT s.*, sc.sclass_name, t.name as teacher_name 
             FROM subjects s 
             LEFT JOIN sclass sc ON s.sclass_id = sc.sclass_id 
             LEFT JOIN teachers t ON s.teacher_id = t.teacher_id 
             WHERE s.sub_code = ? AND sc.sclass_name = ?`,
            [subject.subCode, subject.sclassName.sclassName]
        );

        // Combine data
        const response = {
            ...subject.toObject(),
            mysql_id: mysqlSubject[0]?.subject_id
        };

        res.send(response);
    } catch (err) {
        console.error('Error fetching subject details:', err);
        res.status(500).json({ message: 'Failed to fetch subject details', error: err.message });
    }
};

const deleteSubject = async (req, res) => {
    try {
        // Get subject details from MongoDB
        const subjectToDelete = await Subject.findById(req.params.id);
        if (!subjectToDelete) {
            return res.status(404).send({ message: "Subject not found" });
        }

        // Get MySQL IDs
        const admin = await Admin.findById(subjectToDelete.school);
        const [mysqlAdmin] = await db.mysql.execute(
            'SELECT admin_id FROM admin WHERE email = ?',
            [admin.email]
        );

        const sclass = await Sclass.findById(subjectToDelete.sclassName);
        const [mysqlClass] = await db.mysql.execute(
            'SELECT sclass_id FROM sclass WHERE sclass_name = ? AND admin_id = ?',
            [sclass.sclassName, mysqlAdmin[0].admin_id]
        );

        // Delete from MongoDB
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

        // Delete from MySQL
        await db.mysql.execute(
            'DELETE FROM subjects WHERE sub_code = ? AND sclass_id = ? AND admin_id = ?',
            [subjectToDelete.subCode, mysqlClass[0].sclass_id, mysqlAdmin[0].admin_id]
        );

        // Update related collections/tables
        await Teacher.updateOne(
            { teachSubject: deletedSubject._id },
            { $unset: { teachSubject: "" } }
        );

        await db.mysql.execute(
            'UPDATE teachers SET subject_id = NULL WHERE subject_id IN (SELECT subject_id FROM subjects WHERE sub_code = ?)',
            [subjectToDelete.subCode]
        );

        // Update student records
        await Student.updateMany(
            {},
            { 
                $pull: { 
                    examResult: { subName: deletedSubject._id },
                    attendance: { subName: deletedSubject._id }
                }
            }
        );

        res.send(deletedSubject);
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ message: 'Failed to delete subject', error: error.message });
    }
};

const deleteSubjects = async (req, res) => {
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
        const deletedSubjects = await Subject.deleteMany({ school: req.params.id });

        // Delete from MySQL
        await db.mysql.execute(
            'DELETE FROM subjects WHERE admin_id = ?',
            [mysqlAdmin[0].admin_id]
        );

        // Update teachers in MongoDB
        await Teacher.updateMany(
            { school: req.params.id },
            { $unset: { teachSubject: "" } }
        );

        // Update teachers in MySQL
        await db.mysql.execute(
            'UPDATE teachers SET subject_id = NULL WHERE admin_id = ?',
            [mysqlAdmin[0].admin_id]
        );

        // Update students in MongoDB
        await Student.updateMany(
            { school: req.params.id },
            { $set: { examResult: [], attendance: [] } }
        );

        res.send(deletedSubjects);
    } catch (error) {
        console.error('Error deleting subjects:', error);
        res.status(500).json({ message: 'Failed to delete subjects', error: error.message });
    }
};

const deleteSubjectsByClass = async (req, res) => {
    try {
        // Get class details
        const sclass = await Sclass.findById(req.params.id);
        if (!sclass) {
            return res.status(404).send({ message: "Class not found" });
        }

        // Get MySQL IDs
        const admin = await Admin.findById(sclass.school);
        const [mysqlAdmin] = await db.mysql.execute(
            'SELECT admin_id FROM admin WHERE email = ?',
            [admin.email]
        );

        const [mysqlClass] = await db.mysql.execute(
            'SELECT sclass_id FROM sclass WHERE sclass_name = ? AND admin_id = ?',
            [sclass.sclassName, mysqlAdmin[0].admin_id]
        );

        // Delete from MongoDB
        const deletedSubjects = await Subject.deleteMany({ sclassName: req.params.id });

        // Delete from MySQL
        await db.mysql.execute(
            'DELETE FROM subjects WHERE sclass_id = ?',
            [mysqlClass[0].sclass_id]
        );

        // Update teachers in MongoDB
        await Teacher.updateMany(
            { teachSclass: req.params.id },
            { $unset: { teachSubject: "" } }
        );

        // Update teachers in MySQL
        await db.mysql.execute(
            'UPDATE teachers SET subject_id = NULL WHERE sclass_id = ?',
            [mysqlClass[0].sclass_id]
        );

        // Update students in MongoDB
        await Student.updateMany(
            { sclassName: req.params.id },
            { $set: { examResult: [], attendance: [] } }
        );

        res.send(deletedSubjects);
    } catch (error) {
        console.error('Error deleting subjects by class:', error);
        res.status(500).json({ message: 'Failed to delete subjects', error: error.message });
    }
};

module.exports = {
    subjectCreate,
    allSubjects,
    classSubjects,
    freeSubjectList,
    getSubjectDetail,
    deleteSubject,
    deleteSubjects,
    deleteSubjectsByClass
};