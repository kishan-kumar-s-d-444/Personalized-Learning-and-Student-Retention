const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const { db } = require('../config/db'); 

const adminRegister = async (req, res) => {
    try {
        // Log incoming request
        console.log('Registration request received:', {
            ...req.body,
            password: '[REDACTED]' // Don't log passwords
        });

        const { name, email, password, role, schoolName } = req.body;
        
        // Validation with detailed errors
        if (!name) return res.status(400).send({ message: 'Name is required' });
        if (!email) return res.status(400).send({ message: 'Email is required' });
        if (!password) return res.status(400).send({ message: 'Password is required' });
        if (!schoolName) return res.status(400).send({ message: 'School name is required' });

        // Check for existing admin in MongoDB
        const existingAdminByEmail = await Admin.findOne({ email });
        const existingSchool = await Admin.findOne({ schoolName });

        if (existingAdminByEmail) {
            return res.status(400).send({ message: 'Email already exists' });
        } else if (existingSchool) {
            return res.status(400).send({ message: 'School name already exists' });
        }

        // Create new admin in MongoDB
        const admin = new Admin({
            name,
            email,
            password,
            role: role || 'Admin',
            schoolName
        });

        console.log('Attempting to save to MongoDB...');
        const mongoResult = await admin.save();
        console.log('MongoDB save successful');

        // Insert into MySQL
        try {
            console.log('Attempting MySQL insertion...');
            const [mysqlResult] = await db.mysql.execute(
                'INSERT INTO admin (name, email, password, role, school_name) VALUES (?, ?, ?, ?, ?)',
                [name, email, password, role || 'Admin', schoolName]
            );
            console.log('MySQL insertion successful');

            // Send response without password
            const response = { ...mongoResult.toObject() };
            delete response.password;
            res.status(200).send(response);
            
        } catch (mysqlError) {
            // If MySQL fails, rollback MongoDB insertion
            console.error('MySQL Error:', mysqlError);
            await Admin.findByIdAndDelete(mongoResult._id);
            return res.status(500).send({ 
                message: 'Registration failed', 
                error: mysqlError.message,
                sqlState: mysqlError.sqlState,
                sqlMessage: mysqlError.sqlMessage 
            });
        }
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).send({ 
            message: 'Internal Server Error', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

const adminLogIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).send({ message: "Email and password are required" });
        }

        // Check in MongoDB
        const mongoAdmin = await Admin.findOne({ email });
        
        // Check in MySQL
        const [mysqlResults] = await db.mysql.execute(
            'SELECT * FROM admin WHERE email = ?',
            [email]
        );
        const mysqlAdmin = mysqlResults[0];

        // Verify admin exists in both databases
        if (!mongoAdmin || !mysqlAdmin) {
            console.log('Admin not found in one or both databases');
            return res.status(401).send({ message: "Invalid email or password" });
        }

        // Verify password
        if (password !== mongoAdmin.password) {
            return res.status(401).send({ message: "Invalid email or password" });
        }

        // Send response without sensitive data
        const response = {
            _id: mongoAdmin._id,
            name: mongoAdmin.name,
            email: mongoAdmin.email,
            role: mongoAdmin.role,
            schoolName: mongoAdmin.schoolName
        };

        res.status(200).send(response);

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send({ 
            message: 'Login failed', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getAdminDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Get from MongoDB using ID
        const mongoAdmin = await Admin.findById(id);
        
        if (!mongoAdmin) {
            return res.status(404).send({ message: "Admin not found" });
        }

        // Verify in MySQL using email
        const [mysqlResults] = await db.mysql.execute(
            'SELECT * FROM admin WHERE email = ?',
            [mongoAdmin.email]
        );
        const mysqlAdmin = mysqlResults[0];

        if (!mysqlAdmin) {
            console.warn(`Data inconsistency: Admin found in MongoDB but not in MySQL. ID: ${id}`);
            return res.status(404).send({ message: "Admin data inconsistent across databases" });
        }

        // Send response without sensitive data
        const response = {
            _id: mongoAdmin._id,
            name: mongoAdmin.name,
            email: mongoAdmin.email,
            role: mongoAdmin.role,
            schoolName: mongoAdmin.schoolName,
            mysql_id: mysqlAdmin.admin_id
        };

        res.status(200).send(response);

    } catch (err) {
        console.error('Error fetching admin details:', err);
        res.status(500).send({ 
            message: 'Error fetching admin details', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        // Get all admins from MongoDB
        const admins = await Admin.find({}, { password: 0 }); // Exclude password field
        
        if (!admins || admins.length === 0) {
            return res.status(404).send({ message: "No admins found" });
        }

        res.status(200).send(admins);
    } catch (err) {
        console.error('Error fetching all admins:', err);
        res.status(500).send({ 
            message: 'Error fetching all admins', 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail, getAllAdmins };