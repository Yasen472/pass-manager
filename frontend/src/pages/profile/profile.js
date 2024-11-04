import { React, useEffect } from 'react';
import { useAuth } from '../../context/authContext.js';
import './profile.css'

const Profile = () => {

  const { username } = useAuth();

  useEffect(() => {
    debugger;
    console.log(username);
  }, [])

  return (
    <div className="profile-page">
      <h2>User Profile</h2>
      <div>Here you can easily manage your account details.</div>
      <div className="greeting-heading">Hello, {username}</div>
      <div>Security</div>
    </div>

  )
}

export default Profile;