import React from 'react';
import { useLocation } from 'react-router-dom';

const Verify2FA = () => {
  const location = useLocation();
  const { qrCodeUrl } = location.state || {}; // Retrieve qrCodeUrl from location state

  return (
    <div className="verify-2fa">
      <h3>Scan the QR Code with Google Authenticator</h3>
      {qrCodeUrl ? (
        <img src={qrCodeUrl} alt="QR Code for 2FA" />
      ) : (
        <p>QR Code not available. Please try again.</p>
      )}
      <p>After scanning, please proceed to login.</p>
    </div>
  );
};

export default Verify2FA;
