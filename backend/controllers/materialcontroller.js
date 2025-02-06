const Material = require('../models/Material');
const cloudinary = require('../config/cloudinaryConfig');
const fs = require('fs');

// Upload Material
const uploadMaterial = async (req, res) => {
    try {
        const { title, description, teacherId, subjectId, sclassId } = req.body;
        const filePath = req.file.path;

        // Check if the file is a PDF
        const isPDF = req.file.mimetype === 'application/pdf';

        // Use 'raw' resource type for PDFs in Cloudinary
        const resourceType = isPDF ? 'raw' : req.file.mimetype.split('/')[0];

        console.log('Uploading file to Cloudinary with resourceType:', resourceType);

        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: resourceType, // 'raw' for PDFs
        });

        const material = new Material({
            title,
            description,
            fileUrl: result.secure_url, // Directly use Cloudinary URL
            teacherId,
            subjectId,
            sclassId,
        });

        await material.save();
        fs.unlinkSync(filePath); // Remove the file from the server after upload

        res.status(201).json(material);
    } catch (error) {
        console.error('Error uploading material:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get Materials
const getMaterials = async (req, res) => {
    try {
        const sclassId = req.params.sclassId;

        if (typeof sclassId !== 'string') {
            console.error('Invalid sclassId received:', sclassId);
            return res.status(400).json({ message: 'Invalid sclassId' });
        }

        console.log('Fetching materials for sclassId:', sclassId);
        const materials = await Material.find({ sclassId });

        if (!materials.length) {
            console.log('No materials found for sclassId:', sclassId);
        }

        res.status(200).json(materials);
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete Material
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        console.log('Material found:', material);

        // Extract the publicId from the fileUrl
        const publicId = material.fileUrl.split('/').slice(-1)[0].split('.')[0];
        console.log('Deleting file from Cloudinary with publicId:', publicId);

        // Determine the resource type based on the file URL
        let resourceType = 'raw'; // Default resource type for PDFs
        if (material.fileUrl.includes('/image/')) {
            resourceType = 'image';
        } else if (material.fileUrl.includes('/video/')) {
            resourceType = 'video';
        }
        console.log('Resource type determined:', resourceType);

        // Delete the file from Cloudinary
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

        console.log('File deleted from Cloudinary. Removing material from DB...');
        await Material.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Material deleted successfully' });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ message: error.message });
    }
};

const getMaterialsBySubjectAndClass = async (req, res) => {
    try {
        const { subjectId, sclassId } = req.params;

        if (typeof subjectId !== 'string' || typeof sclassId !== 'string') {
            console.error('Invalid subjectId or sclassId:', subjectId, sclassId);
            return res.status(400).json({ message: 'Invalid subjectId or sclassId' });
        }

        console.log('Fetching materials for subjectId:', subjectId, 'and sclassId:', sclassId);

        // Fetch materials that match both subjectId and sclassId
        const materials = await Material.find({ subjectId, sclassId });

        console.log('Fetched materials:', materials);  // Add this log to verify the response

        if (!materials.length) {
            console.log('No materials found for subjectId:', subjectId, 'and sclassId:', sclassId);
            return res.status(404).json({ message: 'No materials found for this subject and class' });
        }

        res.status(200).json(materials);
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ message: error.message });
    }
};




module.exports = {
    uploadMaterial,
    getMaterials,
    deleteMaterial,
};
