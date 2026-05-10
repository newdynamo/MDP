const { db, save } = require('../models/store');
const mongo = require('../models/mongo');

const MAX_ATTACHMENTS = 5;
const MAX_TITLE = 200;
const MAX_BODY = 10000;

function newId(prefix) {
    return prefix + '_' + Date.now() + Math.random().toString(36).substr(2, 6);
}

function findUser(userId, email) {
    return db.users.find(u => u.id === userId) || db.users.find(u => u.email === email);
}

function canModify(authorId, requesterId, requesterEmail) {
    const requester = findUser(requesterId, requesterEmail);
    if (!requester) return false;
    if (requester.role === 'ADMIN') return true;
    return authorId === requester.id;
}

async function uploadFilesToGridFS(files) {
    const bucket = mongo.getGridFSBucket();
    if (!bucket) throw new Error('MongoDB is not connected. Attachments require MongoDB.');

    const uploads = [];
    for (const f of files) {
        const meta = await new Promise((resolve, reject) => {
            const stream = bucket.openUploadStream(f.originalname, { contentType: f.mimetype });
            stream.on('error', reject);
            stream.on('finish', () => {
                resolve({
                    fileId: stream.id.toString(),
                    filename: f.originalname,
                    contentType: f.mimetype,
                    size: f.size
                });
            });
            stream.end(f.buffer);
        });
        uploads.push(meta);
    }
    return uploads;
}

async function deleteFilesFromGridFS(attachments) {
    const bucket = mongo.getGridFSBucket();
    if (!bucket || !attachments) return;
    for (const a of attachments) {
        try {
            await bucket.delete(new mongo.mongoose.Types.ObjectId(a.fileId));
        } catch (e) {
            console.warn(`Failed to delete GridFS file ${a.fileId}:`, e.message);
        }
    }
}

exports.listPosts = (req, res) => {
    const summary = db.posts
        .map(p => ({
            id: p.id,
            title: p.title,
            authorId: p.authorId,
            authorName: p.authorName,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            replyCount: (p.replies || []).length,
            attachmentCount: (p.attachments || []).length
        }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json({ success: true, posts: summary });
};

exports.getPost = (req, res) => {
    const post = db.posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
};

exports.createPost = async (req, res) => {
    try {
        const { title, body, authorId, authorEmail } = req.body || {};
        if (!title || !body) {
            return res.status(400).json({ success: false, message: 'Title and body are required.' });
        }
        const author = findUser(authorId, authorEmail);
        if (!author) return res.status(401).json({ success: false, message: 'Author not found.' });

        const files = req.files || [];
        if (files.length > MAX_ATTACHMENTS) {
            return res.status(400).json({ success: false, message: `Max ${MAX_ATTACHMENTS} attachments per post.` });
        }

        let attachments = [];
        if (files.length > 0) {
            if (!mongo.isMongoConnected()) {
                return res.status(503).json({ success: false, message: 'Attachments require MongoDB. Server is running without DB.' });
            }
            attachments = await uploadFilesToGridFS(files);
        }

        const now = Date.now();
        const post = {
            id: newId('post'),
            authorId: author.id,
            authorName: author.name,
            authorEmail: author.email,
            title: String(title).slice(0, MAX_TITLE),
            body: String(body).slice(0, MAX_BODY),
            attachments,
            replies: [],
            createdAt: now,
            updatedAt: now
        };

        db.posts.unshift(post);
        save.posts();
        res.json({ success: true, post });
    } catch (e) {
        console.error('createPost error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { requesterId, requesterEmail } = req.body || {};
        const idx = db.posts.findIndex(p => p.id === req.params.id);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Post not found' });

        const post = db.posts[idx];
        if (!canModify(post.authorId, requesterId, requesterEmail)) {
            return res.status(403).json({ success: false, message: 'Permission denied' });
        }

        await deleteFilesFromGridFS(post.attachments);
        for (const r of (post.replies || [])) {
            await deleteFilesFromGridFS(r.attachments);
        }

        db.posts.splice(idx, 1);
        save.posts();
        res.json({ success: true });
    } catch (e) {
        console.error('deletePost error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
};

exports.createReply = async (req, res) => {
    try {
        const { body, authorId, authorEmail } = req.body || {};
        if (!body) return res.status(400).json({ success: false, message: 'Reply body is required.' });

        const post = db.posts.find(p => p.id === req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const author = findUser(authorId, authorEmail);
        if (!author) return res.status(401).json({ success: false, message: 'Author not found.' });

        const files = req.files || [];
        if (files.length > MAX_ATTACHMENTS) {
            return res.status(400).json({ success: false, message: `Max ${MAX_ATTACHMENTS} attachments per reply.` });
        }

        let attachments = [];
        if (files.length > 0) {
            if (!mongo.isMongoConnected()) {
                return res.status(503).json({ success: false, message: 'Attachments require MongoDB. Server is running without DB.' });
            }
            attachments = await uploadFilesToGridFS(files);
        }

        const reply = {
            id: newId('reply'),
            authorId: author.id,
            authorName: author.name,
            authorEmail: author.email,
            body: String(body).slice(0, MAX_BODY),
            attachments,
            createdAt: Date.now()
        };

        if (!post.replies) post.replies = [];
        post.replies.push(reply);
        post.updatedAt = Date.now();
        save.posts();
        res.json({ success: true, reply });
    } catch (e) {
        console.error('createReply error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
};

exports.deleteReply = async (req, res) => {
    try {
        const { requesterId, requesterEmail } = req.body || {};
        const post = db.posts.find(p => p.id === req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const ridx = (post.replies || []).findIndex(r => r.id === req.params.replyId);
        if (ridx === -1) return res.status(404).json({ success: false, message: 'Reply not found' });

        const reply = post.replies[ridx];
        if (!canModify(reply.authorId, requesterId, requesterEmail)) {
            return res.status(403).json({ success: false, message: 'Permission denied' });
        }

        await deleteFilesFromGridFS(reply.attachments);
        post.replies.splice(ridx, 1);
        post.updatedAt = Date.now();
        save.posts();
        res.json({ success: true });
    } catch (e) {
        console.error('deleteReply error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
};

exports.downloadFile = (req, res) => {
    const bucket = mongo.getGridFSBucket();
    if (!bucket) return res.status(503).json({ success: false, message: 'Attachments require MongoDB.' });

    let objectId;
    try {
        objectId = new mongo.mongoose.Types.ObjectId(req.params.fileId);
    } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid file id.' });
    }

    bucket.find({ _id: objectId }).toArray().then(files => {
        if (!files || files.length === 0) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
        const file = files[0];
        const safeName = encodeURIComponent(file.filename);
        res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${safeName}`);
        res.setHeader('Content-Length', file.length);
        const stream = bucket.openDownloadStream(objectId);
        stream.on('error', err => {
            console.error('Download stream error:', err);
            if (!res.headersSent) res.status(500).end();
            else res.end();
        });
        stream.pipe(res);
    }).catch(e => {
        console.error('downloadFile error:', e);
        res.status(500).json({ success: false, message: e.message });
    });
};
