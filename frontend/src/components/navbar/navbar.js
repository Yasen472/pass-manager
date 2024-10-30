import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import { useAuth } from "../../context/authContext.js";
import { FaBars } from 'react-icons/fa'; 

const Navbar = () => {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false); 

    const handleLogout = () => {
        logout();
        navigate("/");
        setMenuOpen(false); 
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLinkClick = () => {
        setMenuOpen(false);
    };

    return (
        <div className="navbar-container">
            <Link to="/" className="nav-link-header" onClick={handleLinkClick}>
                Password Manager
            </Link>

            <div className={`links ${menuOpen ? 'active' : ''}`}>
                {isLoggedIn ? (
                    <>
                        <Link to="/profile" className="nav-link" onClick={handleLinkClick}>
                            Profile
                        </Link>
                        <Link to="/" onClick={handleLogout} className="nav-link">
                            Logout
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link" onClick={handleLinkClick}>
                            Login
                        </Link>
                        <Link to="/register" className="nav-link" onClick={handleLinkClick}>
                            Register
                        </Link>
                    </>
                )}
            </div>

            <div className="menu-icon" onClick={toggleMenu}>
                <FaBars />
            </div>
        </div>
    );
};

export default Navbar;
