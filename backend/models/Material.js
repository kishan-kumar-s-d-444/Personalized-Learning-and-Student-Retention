const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    fileUrl: { type: String, required: true },
    teacherId: { type: String, required: true },
    subjectId: { type: String, required: true },
    sclassId: { type: String, required: true },
}, { timestamps: true });

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;
