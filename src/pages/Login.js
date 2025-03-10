import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "../App.css";
import "../styles/Login.css";
import logo from "../assets/logo.png";
import axios from "axios";

const LoginSignup = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // Signup Function
    const handleSignup = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/register", { username, password });
            alert(response.data.message);
            setIsSignup(false);
            setUsername("");
            setPassword("");
        } catch (error) {
            alert(error.response.data.message || "Signup failed!");
        }
    };

    // Login Function
    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/login", { username, password });
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("loggedInUser", response.data.username);
            alert("Login successful!");
            navigate("/");
        } catch (error) {
            alert(error.response.data.message || "Login failed!");
        }
    };       
    return (
        <div className="login-container">
            <a href="/">
                <img src={logo} className="brand-logo" alt="Your Brand Logo" />
            </a>
            <div className="main">
                {isSignup ? (
                    <div className="signup">
                        <form onSubmit={handleSignup}>
                            <label>Sign up</label>
                            <input className="mx-auto form-control" style={{ width: "80%"}} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
                            <input className="mx-auto form-control" style={{ width: "80%"}} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                            <button className="btn" id="loginsignup" type="submit">Sign up</button>
                        </form>
                        <p className="my-5">Already have an account? <span onClick={() => setIsSignup(false)}>Login</span></p>
                    </div>
                ) : (
                    <div className="login">
                        <form onSubmit={handleLogin}>
                            <label>Login</label>
                            <input className="mx-auto form-control" style={{ width: "80%"}} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
                            <input className="mx-auto form-control" style={{ width: "80%"}} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                            <button className="btn" id="loginsignup" type="submit">Login</button>
                        </form>
                        <p className="my-5">Don't have an account? <span onClick={() => setIsSignup(true)}>Sign up</span></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginSignup;