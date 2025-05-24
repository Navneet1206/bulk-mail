// frontend/src/pages/SendEmail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SendEmail = () => {
  const [formData, setFormData] = useState({ senderEmail: '', appPassword: '', subject: '', message: '' });
  const [file, setFile] = useState(null);
  const [logo, setLogo] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/email/templates', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => setTemplates(res.data));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Send Bulk Email</h2>
      <div onSubmit={handleSubmit}>
        <input type="email" name="senderEmail" placeholder="Sender Email" onChange={handleChange} className="w-full mb-2 p-2 border" />
        <input type="password" name="appPassword" placeholder="App Password" onChange={handleChange} className="w-full mb-2 p-2 border" />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".csv,.xls,.txt" className="w-full mb-2" />
        <select onChange={(e) => setSelectedTemplate(e.target.value)} className="w-full mb-2 p-2 border">
          <option value="">Select Template</option>
          {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input type="text" name="subject" placeholder="Subject" onChange={handleChange} className="w-full mb-2 p-2 border" />
        <textarea name="message" placeholder="Message" onChange={handleChange} className="w-full mb-2 p-2 border" />
        {selectedTemplate && templates.find(t => t.id == selectedTemplate)?.type === 'premium' && (
          <input type="file" onChange={(e) => setLogo(e.target.files[0])} accept="image/*" className="w-full mb-2" />
        )}
        <button onClick={handleSubmit} className="w-full bg-blue-500 text-white p-2">Send Emails</button>
      </div>
    </div>
  );
};

export default SendEmail;