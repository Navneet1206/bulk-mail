import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SendEmail = () => {
  const [formData, setFormData] = useState({ senderEmail: '', appPassword: '', subject: '', message: '' });
  const [file, setFile] = useState(null);
  const [logo, setLogo] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/email/templates', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => setTemplates(res.data))
      .catch(err => setError('Failed to load templates'));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload an email list file');
      return;
    }
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('file', file);
    if (logo) data.append('logo', logo);
    data.append('templateId', selectedTemplate);

    try {
      await axios.post('http://localhost:5000/api/email/send', data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Emails sent successfully');
      setFormData({ senderEmail: '', appPassword: '', subject: '', message: '' });
      setFile(null);
      setLogo(null);
      setSelectedTemplate('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send emails');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Send Bulk Email</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="senderEmail"
          placeholder="Sender Email"
          value={formData.senderEmail}
          onChange={handleChange}
          className="w-full p-2 border"
          required
        />
        <input
          type="password"
          name="appPassword"
          placeholder="App Password"
          value={formData.appPassword}
          onChange={handleChange}
          className="w-full p-2 border"
          required
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          accept=".csv,.txt"
          className="w-full p-2"
        />
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="w-full p-2 border"
          required
        >
          <option value="">Select Template</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full p-2 border"
          required
        />
        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          className="w-full p-2 border"
          rows="4"
          required
        />
        {selectedTemplate && templates.find(t => t.id == selectedTemplate)?.type === 'premium' && (
          <input
            type="file"
            onChange={(e) => setLogo(e.target.files[0])}
            accept="image/*"
            className="w-full p-2"
          />
        )}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Send Emails</button>
      </form>
    </div>
  );
};

export default SendEmail;