const express = require('express');
const multer = require('multer');
const router = express.Router();
const boardController = require('../controllers/boardController');

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 5;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES }
});

function handleUpload(req, res, next) {
    upload.array('files', MAX_FILES)(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File too large. Max 5MB per file.' });
            }
            if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({ success: false, message: `Max ${MAX_FILES} files.` });
            }
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}

router.get('/posts', boardController.listPosts);
router.get('/posts/:id', boardController.getPost);
router.post('/posts', handleUpload, boardController.createPost);
router.delete('/posts/:id', boardController.deletePost);
router.post('/posts/:id/replies', handleUpload, boardController.createReply);
router.delete('/posts/:id/replies/:replyId', boardController.deleteReply);
router.get('/files/:fileId', boardController.downloadFile);

module.exports = router;
