import React, { useEffect, useState } from 'react';
import styles from './login.module.css';
import PanelLogo from '../SharedComponent/CompanyLogo';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { postRequest } from '../../api/Requests';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
// import io from 'socket.io-client';

// const socket = io(process.env.REACT_APP_SERVER_URL);

const Login = () => {
    const navigate = useNavigate()
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [username, setUsername]               = useState("");
    const [password, setPassword]               = useState("");
    const [errors, setErrors]                   = useState({ username: '', password: '' });
    const [loading, setLoading]                 = useState(false);
    const [baseUrl, setBaseUrl]               = useState("");

    const togglePasswordVisibility = () => {
        if (password.length > 0) {
            setPasswordVisible(!passwordVisible);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let validationErrors = { username: '', password: '' };

        if (!username.trim()) {
            validationErrors.username = 'Username is required';
        }
        if (!password.trim()) {
            validationErrors.password = 'Password is required';
        } else if (password.length < 6) {
            validationErrors.password = 'Password must be at least 6 characters long';
        }
        setErrors(validationErrors);

        if (!validationErrors.username && !validationErrors.password) {
            setLoading(true); 
            
            const obj = {
                email    : username,
                password : password
            }
            postRequest('login', obj, async(response) => {
                if (response.code === 200) {
                    
                    toast(response.message || response.message[0], { type : 'success' })
                    const userDetails = {
                        user_id      : response.userDetails.id,
                        name         : response.userDetails.name,
                        email        : response.userDetails.email,
                        phone        : response.userDetails.phone,
                        image        : response.userDetails.image,
                        access_token : response.Token,
                        base_url     : response.base_url,
                        departmentId : response.userDetails.department_id 
                    };
                    sessionStorage.setItem('userDetails', JSON.stringify(userDetails));
                    
                    setTimeout(() => {
                        navigate('/')
                    }, 1000);

                    // if (Notification.permission !== 'granted') {
                    //     Notification.requestPermission();
                    //   }
                  
                    //   socket.on('desktop-notification', (data) => {
                    //     if (Notification.permission === 'granted') {
                    //       new Notification(data.title, {
                    //         body: data.message,
                    //       });
                    //     }
                    //   });
                } else {
                    toast(response.message, {type:'error'})
                    setLoading(false);
                }
            })
        }
    };

    useEffect(() => {
        const userDetails = sessionStorage.getItem('userDetails');
        if (userDetails) {
            const { access_token } = JSON.parse(userDetails);
            if (access_token) {
                navigate(-1);
            }
        }
    }, [navigate]);

    return (
        <>
        <ToastContainer />
        <div className="container">
            <div className={styles.formMainContainer}>
                <div className={styles.formSection}>
                    <div className={styles.formImgSection}>
                        <PanelLogo />
                    </div>
                    <form className={styles.formContainer} onSubmit={handleSubmit}>
                        <div className={styles.formFiled}>
                            <label className={styles.formLabel}>Username</label>
                            <input
                                className={styles.formInput}
                                type="text"
                                maxLength={50}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            {errors.username && <span className={styles.error} style={{color:'red'}}>{errors.username}</span>}
                        </div>
                        <div className={styles.formFiled}>
                            <label className={styles.formLabel}>Password</label>
                            <div className={styles.passwordContainer}>
                                <input
                                    className={styles.formInput}
                                    type={passwordVisible ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div
                                    className={styles.eyeIcon}
                                    onClick={togglePasswordVisibility}
                                    style={{ color: passwordVisible ? '#00ffc3' : '#fff' }}
                                >
                                    {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                                </div>
                            </div>
                            {errors.password && <span className={styles.error} style={{color:'red'}}>{errors.password}</span>}
                        </div>
                        <div className={styles.formPassword}>
                            Forgot Password?
                        </div>
                        <div className={styles.formButtonSection}>
                            <button disabled={loading} type="submit" className={styles.formButton}>
                            {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Login...
                                    </>
                                ) : (
                                    "Login"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
};


export default Login;
