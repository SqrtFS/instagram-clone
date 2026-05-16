import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./AuthPage.module.css"; 

export default function AuthPage() {
  const [isActive, setIsActive] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(loginData.username, loginData.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await register(registerData);
      if (result.success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={`${styles.container} ${isActive ? styles.active : ""}`}>
      
      <div className={`${styles["form-container"]} ${styles["sign-up"]}`}>
        <form onSubmit={handleRegister}>
          <h1>Create Account</h1>

    
          <span>Use your email for registration</span>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={registerData.username}
            onChange={handleRegisterChange}
            required
            minLength="3"
          />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={registerData.name}
            onChange={handleRegisterChange}
            required
            minLength="2"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={registerData.email}
            onChange={handleRegisterChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={registerData.password}
            onChange={handleRegisterChange}
            required
            minLength="3"
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </div>

      <div className={`${styles["form-container"]} ${styles["sign-in"]}`}>
        <form onSubmit={handleLogin}>
          <h1>Sign In</h1>

          <span>Use your username and password</span>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={loginData.username}
            onChange={handleLoginChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleLoginChange}
            required
          />
          <a href="#">Forget Your Password?</a>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>

      <div className={styles["toggle-container"]}>
        <div className={styles.toggle}>

          <div className={`${styles["toggle-panel"]} ${styles["toggle-left"]}`}>
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all features</p>
            <button className={styles.hidden} onClick={() => setIsActive(false)}>
              Sign In
            </button>
          </div>

          <div className={`${styles["toggle-panel"]} ${styles["toggle-right"]}`}>
            <h1>Hello, Friend!</h1>
            <p>Register with your personal details</p>
            <button className={styles.hidden} onClick={() => setIsActive(true)}>
              Sign Up
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}