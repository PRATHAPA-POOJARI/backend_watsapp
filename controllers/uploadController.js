const cloudinary = require("../config/cloudinary");

// upload controller

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }   

    const isImage = req.file.mimetype.startsWith("image/");

    // Generate signed url(expires in 1 hour)
 const signedUrl = cloudinary.utils.private_download_url(
      req.file.filename,
      isImage ? "jpg" : "raw",
      {
        resource_type: isImage ? "image" : "raw",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }
    );
    res.json({
      url: signedUrl,
      publicId: req.file.filename,
      type: req.file.mimetype,
      name: req.file.originalname,
      isImage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Upload failed" });
  }
};

// Get fresh signed URL when old one expires
exports.refreshUrl = async (req, res) => {
  try {
    const { publicId, isImage } = req.body;
 
    const signedUrl = cloudinary.utils.private_download_url(
      publicId,
      isImage ? "jpg" : "raw",
      {
        resource_type: isImage ? "image" : "raw",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }
    );
 
    res.json({ url: signedUrl });
  } catch (err) {
    res.status(500).json({ msg: "Failed to refresh URL" });
  }
};