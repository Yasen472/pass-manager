import './App.css';
import { AuthProvider } from './context/authContext.js';
import Login from './pages/login/login.js';
import { Route, Routes } from 'react-router-dom'
import Register from './pages/register/register.js';
import Home from './pages/home/home.js';
import Navbar from './components/navbar/navbar.js';
import Accounts from './pages/accounts/accounts.js';
import Profile from './pages/profile/profile.js';
import Verify2FA from './components/verification/verify2Fa.js';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />=
        <Route path="/register" element={<Register />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/verify-2fa" element={<Verify2FA />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
