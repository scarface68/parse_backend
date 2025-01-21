const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

// Multer storage configuration
const upload = multer({
  dest: "uploads/", // Temporary storage for uploaded files
});

app.use(express.static("public"));
app.use(express.json());
// PDF Upload and Text Extraction
app.post("/upload/pdf", upload.single("document"), (req, res) => {
  const pdfPath = req.file.path;
  const dataBuffer = fs.readFileSync(pdfPath);
  pdfParse(dataBuffer)
    .then((data) => {
      res.json({ text: data.text });
      fs.unlinkSync(pdfPath); // Remove file after processing
    })
    .catch((err) => {
      res.status(500).send(err.message);
      fs.unlinkSync(pdfPath); // Ensure cleanup on error
    });
});

// Image Upload and OCR Text Extraction
app.post("/upload/image", upload.single("document"), (req, res) => {
  const imagePath = req.file.path;

  Tesseract.recognize(imagePath, "eng", {
    logger: (m) => console.log(m), // Optional: logs progress
  })
    .then(({ data: { text } }) => {
      res.json({ text });
      fs.unlinkSync(imagePath); // Remove file after processing
    })
    .catch((err) => {
      res.status(500).send(err.message);
      fs.unlinkSync(imagePath); // Ensure cleanup on error
    });
});

// Default route
app.get("/", (req, res) => {
  res.send("File upload server is running.");
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
