const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Store uploaded files in 'uploads/' directory

app.post('/upload', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const csvFilePath = req.file.path;
  const pythonScriptPath = path.join(__dirname, 'anomaly_detection.py'); // Path to your Python script
  const modelPath = path.join(
    __dirname,
    'arima_lstm_reconstruction_anomaly_detection_model.h5'
  );

  const pythonProcess = spawn('python3', [
    pythonScriptPath,
    csvFilePath,
    modelPath,
  ]);
  let pythonOutput = '';
  let pythonError = '';

  pythonProcess.stdout.on('data', data => {
    pythonOutput += data.toString();
  });

  pythonProcess.stderr.on('data', data => {
    pythonError += data.toString();
  });

  pythonProcess.on('close', code => {
    if (code !== 0) {
      console.error(`Python script error: ${pythonError}`);
      return res.status(500).json({ error: 'Python script execution failed.' });
    }

    try {
      const jsonResponse = JSON.parse(pythonOutput);
      if (jsonResponse.error) {
        return res.status(500).json({ error: jsonResponse.error });
      }

      // Create a new CSV file with anomalies marked.
      const newCsvFilePath = path.join(
        __dirname,
        'updated_' + req.file.originalname
      );
      fs.writeFileSync(newCsvFilePath, jsonResponse.csvData); // jsonResponse.csvData should contain the CSV data.

      res.setHeader(
        'Content-Disposition',
        `attachment; filename=updated_${req.file.originalname}`
      );
      res.sendFile(newCsvFilePath, () => {
        // Clean up temporary files
        fs.unlinkSync(csvFilePath);
        fs.unlinkSync(newCsvFilePath);
      });
    } catch (err) {
      console.error('Error processing Python output:', err);
      return res.status(500).json({ error: 'Error processing Python output.' });
    }
  });
});

app.get('/download', (req, res) => {
  const updatedCSV = path.join(__dirname, 'updated_file.csv'); //path to the updated file.
  res.setHeader('Content-Disposition', 'attachment; filename=updated_file.csv');
  res.sendFile(updatedCSV);
});

app.listen(5000, () => {
  console.log('Server listening on port 5000');
});
