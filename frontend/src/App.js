import './App.css';
import { AuthProvider } from './context/authContext.js';
import Login from './pages/login/login.js';
import { Route, Routes } from 'react-router-dom'
import Register from './pages/register/register.js';
import Home from './pages/home/home.js';
import Navbar from './components/navbar/navbar.js';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />=
        <Route path="/register" element={<Register />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
