const multer = require("multer"); // we are using this package multer to handle the files that will ne comming with the first post request and agreement

const DOC_MIME_TYPE_MAP = {
  "application/pdf": "pdf",
  "application/msword": "doc", // For .doc files
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx", // For .docx files
};

// Storage configuration for documents

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid document type");
    if (isValid) {
      error = null;
    }
    cb(null, "documents");
  },
  filename: (req, file, cb) => {
    console.log("multer is executing some files");
    const name = file.originalname.toLocaleLowerCase().split("").join("-");
    const ext = DOC_MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

module.exports = multer({ storage: storage }).array("document");
