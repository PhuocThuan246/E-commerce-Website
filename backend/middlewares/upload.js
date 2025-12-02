const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ==============================
// Tạo thư mục uploads nếu chưa có
// ==============================
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Tạo thư mục:", uploadDir);
}

// ==============================
// Cấu hình lưu trữ
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// ==============================
// Bộ lọc loại file
// ==============================
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, webp)!"));
  }
};

// ==============================
// Tạo instance Multer
// ==============================
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // tối đa 10MB / ảnh
});

// ==============================
// Cho phép cả 'image' và 'images'
// ==============================
const multiUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 10 },
]);

// ==============================
// Xuất
// ==============================
module.exports = {
  upload,
  multiUpload,
};
