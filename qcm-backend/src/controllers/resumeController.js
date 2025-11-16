const generateResume = require("../scripts/generateResume");

exports.generate = (req, res) => {
  const { subject, chapter, content } = req.body;

  if (!subject || !chapter || !content) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  const pdfUrl = generateResume(subject, chapter, content);
  res.json({ pdfUrl });
};
