import multer from 'multer';

const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, JPEG and PNG files are allowed.'));
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
}).fields([
  { name: 'gov_id', maxCount: 1 },
  { name: 'ownership_proof', maxCount: 1 },
]);

export const kycUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    next();
  });
};