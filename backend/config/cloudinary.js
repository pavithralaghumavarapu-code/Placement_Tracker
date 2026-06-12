let cloudinary = null;

try {
  ({ v2: cloudinary } = require("cloudinary"));

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} catch (error) {
  cloudinary = null;
}

const uploadBuffer = (buffer, options = {}) => {
  if (!cloudinary) {
    const err = new Error("Cloudinary package is not installed or configured");
    err.statusCode = 503;
    throw err;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    stream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadBuffer
};
