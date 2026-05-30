const multer    = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
 cloudinary,
 params:async(req,file)=>{
    return {
         folder: "whatsapp-chat",
         resource_type: isImage ? "image" : "raw",
           type: "private",  
        allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "txt"],
    }
 }
});

const upload = multer({ 
    storage ,

     limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;