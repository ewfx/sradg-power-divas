import React, { useState } from 'react';
import axios from 'axios';
//import FileDownload from 'js-file-download';

function AnomalyDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = event => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file.');
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Important for file download
      });

      // Create download link
      const fileName =
        response.headers['content-disposition'].split('filename=')[1];
      FileDownload(response.data, fileName);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during upload.');
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await axios.get('/download', {
        responseType: 'blob',
      });

      const fileName =
        response.headers['content-disposition'].split('filename=')[1];
      FileDownload(response.data, fileName);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.error || 'An error occurred during download.'
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Anomaly Detection</h2>
      <input type='file' onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload CSV'}
      </button>

      <button onClick={handleDownload} disabled={loading}>
        {loading ? 'Downloading...' : 'Download Updated File'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default AnomalyDetection;
