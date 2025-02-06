const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Admin = require('../models/adminSchema.js');
const { db } = require('../config/db');

const sclassCreate = async (req, res) => {
    try {
        const { sclassName, adminID } = req.body;

        // Validate input
        if (!sclassName || !adminID) {
            return res.status(400).send({ message: 'Class name and admin ID are required' });
        }

        // Check if class exists in MongoDB
        const existingSclassByName = await Sclass.findOne({
            sclassName: sclassName,
            school: adminID
        });

        if (existingSclassByName) {
            return res.status(400).send({ message: 'Sorry this class name already exists' });
        }

        // First, get the MySQL admin_id using MongoDB admin's email
        const admin = await Admin.findById(adminID);
        if (!admin) {
            return res.status(404).send({ message: 'Admin not found' });
        }

        // Get corresponding MySQL admin_id
        const [mysqlAdmin] = await db.mysql.execute(
            'SELECT admin_id FROM admin WHERE email = ?',
            [admin.email]
        );

        if (!mysqlAdmin || mysqlAdmin.length === 0) {
            return res.status(404).send({ message: 'Admin not found in MySQL database' });
        }

        const mysqlAdminId = mysqlAdmin[0].admin_id;

        // Create in MongoDB
        const sclass = new Sclass({
            sclassName: sclassName,
            school: adminID
        });
        
        console.log('Saving to MongoDB...');
        const mongoResult = await sclass.save();

        // Create in MySQL using the MySQL admin_id
        try {
            console.log('Inserting into MySQL...');
            const [mysqlResult] = await db.mysql.execute(
                'INSERT INTO sclass (sclass_name, admin_id) VALUES (?, ?)',
                [sclassName, mysqlAdminId]  // Using MySQL admin_id here
            );
            
            const response = {
                ...mongoResult.toObject(),
                mysql_id: mysqlResult.insertId
            };
            
            res.status(201).send(response);
        } catch (mysqlError) {
            // Rollback MongoDB if MySQL fails
            await Sclass.findByIdAndDelete(mongoResult._id);
            console.error('MySQL Error:', mysqlError);
            return res.status(500).send({
                message: 'Class creation failed',
                error: mysqlError.message
            });
        }
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).send({
            message: 'Internal Server Error',
            error: err.message
        });
    }
};

const sclassList = async (req, res) => {
    try {
        const adminID = req.params.id;

        // Get from MongoDB
        const mongoClasses = await Sclass.find({ school: adminID });

        // Get from MySQL
        const [mysqlClasses] = await db.mysql.execute(
            'SELECT * FROM sclass WHERE admin_id = ?',
            [adminID]
        );

        if (mongoClasses.length > 0) {
            // Combine data from both sources if needed
            const classes = mongoClasses.map(mongoClass => {
                const mysqlClass = mysqlClasses.find(mc => mc.sclass_name === mongoClass.sclassName);
                return {
                    ...mongoClass.toObject(),
                    mysql_id: mysqlClass ? mysqlClass.sclass_id : null
                };
            });
            res.send(classes);
        } else {
            res.send({ message: "No classes found" });
        }
    } catch (err) {
        console.error('Error fetching classes:', err);
        res.status(500).json(err);
    }
};

const deleteSclass = async (req, res) => {
    try {
        const classId = req.params.id;

        // Get class details from MongoDB first
        const classToDelete = await Sclass.findById(classId);
        if (!classToDelete) {
            return res.status(404).send({ message: "Class not found" });
        }

        // Get the admin details from MongoDB to find MySQL admin_id
        const admin = await Admin.findById(classToDelete.school);
        if (!admin) {
            return res.status(404).send({ message: "Admin not found" });
        }

        // Get corresponding MySQL admin_id
        const [mysqlAdmin] = await db.mysql.execute(
            'SELECT admin_id FROM admin WHERE email = ?',
            [admin.email]
        );

        if (!mysqlAdmin || mysqlAdmin.length === 0) {
            return res.status(404).send({ message: 'Admin not found in MySQL database' });
        }

        const mysqlAdminId = mysqlAdmin[0].admin_id;

        // Delete from MongoDB
        const deletedClass = await Sclass.findByIdAndDelete(classId);
        const deletedStudents = await Student.deleteMany({ sclassName: classId });
        const deletedSubjects = await Subject.deleteMany({ sclassName: classId });
        const deletedTeachers = await Teacher.deleteMany({ teachSclass: classId });

        // Delete from MySQL using the correct MySQL admin_id
        await db.mysql.execute(
            'DELETE FROM sclass WHERE sclass_name = ? AND admin_id = ?',
            [classToDelete.sclassName, mysqlAdminId]  // Using MySQL admin_id here
        );

        res.send(deletedClass);
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({
            message: 'Failed to delete class',
            error: error.message
        });
    }
};

const deleteSclasses = async (req, res) => {
    try {
        const adminId = req.params.id;

        // Delete from MongoDB
        const deletedClasses = await Sclass.deleteMany({ school: adminId });
        if (deletedClasses.deletedCount === 0) {
            return res.send({ message: "No classes found to delete" });
        }

        const deletedStudents = await Student.deleteMany({ school: adminId });
        const deletedSubjects = await Subject.deleteMany({ school: adminId });
        const deletedTeachers = await Teacher.deleteMany({ school: adminId });

        // Delete from MySQL
        await db.mysql.execute(
            'DELETE FROM sclass WHERE admin_id = ?',
            [adminId]
        );

        res.send(deletedClasses);
    } catch (error) {
        console.error('Error deleting classes:', error);
        res.status(500).json(error);
    }
};

const getSclassDetail = async (req, res) => {
    try {
        // Get from MongoDB
        let sclass = await Sclass.findById(req.params.id);
        if (!sclass) {
            return res.send({ message: "No class found" });
        }

        // Populate school details
        sclass = await sclass.populate("school", "schoolName");

        // Get from MySQL
        const [mysqlClass] = await db.mysql.execute(
            'SELECT * FROM sclass WHERE sclass_name = ? AND admin_id = ?',
            [sclass.sclassName, sclass.school._id]
        );

        const response = {
            ...sclass.toObject(),
            mysql_id: mysqlClass[0]?.sclass_id
        };

        res.send(response);
    } catch (err) {
        console.error('Error fetching class details:', err);
        res.status(500).json(err);
    }
};

const getSclassStudents = async (req, res) => {
    try {
        let students = await Student.find({ sclassName: req.params.id })
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const getClassTeachers = async (req, res) => {
    try {
        const classId = req.params.id;

        // Find teachers for the specific class
        const teachers = await Teacher.find({ teachSclass: classId })
            .populate('teachSubject', 'subName subCode')  // Use correct field name
            .select('-password');  // Exclude password

        if (teachers.length > 0) {
            res.status(200).send(teachers);
        } else {
            res.status(404).send({ message: "No teachers found for this class" });
        }
    } catch (err) {
        console.error('Error fetching class teachers:', err);
        res.status(500).json({
            message: 'Failed to fetch teachers',
            error: err.message
        });
    }
};

module.exports = { 
    sclassCreate, 
    sclassList, 
    deleteSclass, 
    deleteSclasses, 
    getSclassDetail, 
    getSclassStudents,
    getClassTeachers 
};