const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Folder kade shto ke se zachuvuvaat slikite
const uploadDirectory = path.join(__dirname, "../uploads");

// Kreiraj go folderot ako ne postoi
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Konfiguracija za zachuvuvanje na slikite
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}`;

    cb(null, `${uniqueName}${path.extname(file.originalname)}`);
  },
});

// Dozvoleni tipovi na sliki
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG and WebP images are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = upload;