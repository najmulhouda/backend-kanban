const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/attachmentsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Attachment schema
const attachmentSchema = new mongoose.Schema({
  name: String,
  extension: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const Attachment = mongoose.model('Attachment', attachmentSchema);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route to handle file upload
app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const { description } = req.body;

    const attachments = files.map((file) => ({
      name: file.originalname,
      extension: file.mimetype.split('/').pop(),
      description,
    }));

    await Attachment.insertMany(attachments);

    const count = await Attachment.countDocuments();

    res.status(200).json({ message: 'Files uploaded successfully', count });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading files', error });
  }
});

// Route to fetch all attachments with count
app.get('/attachments', async (req, res) => {
  try {
    const attachments = await Attachment.find();
    const count = await Attachment.countDocuments();

    res.status(200).json({ attachments, count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attachments', error });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
