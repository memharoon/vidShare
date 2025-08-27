// pages/ForgotPassword.js
import React, { useState } from 'react';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // For now, just simulate request or hit backend if implemented
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage('✅ If your email is registered, password reset instructions will be sent.');
    } catch (error) {
      setMessage('❌ Error: Unable to process request.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '30px auto' }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p style={{ marginTop: '10px' }}>{message}</p>}
    </div>
  );
}

export default ForgotPassword;
