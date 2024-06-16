import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const PasswordRecovery = () => {
    const [recoveryState, setRecoveryState] = useState(0);
    const [username, setUsername] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [loginInfo, setLoginInfo] = useState('');

    const sendEmail = async () => {
        try {
            const response = await fetch("/api/account/passwordChangeEmail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(username),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setRecoveryState(0);
                    setLoginInfo("Username doesn't exist");
                }
            }
            else {
                setRecoveryState(2);
            }

        } catch (error) {
            console.error("Error:", error.message);
        }
    }

    const use2FA = () => {
        setRecoveryState(3);
    };

    const changePassword = async () => {
        var data = {
            "username": username,
            "newPassword": password,
            "code": code,
            "email": true,
            "fa": true
        }
        if (recoveryState === 2) {
            data.f2 = false;
        }
        else if (recoveryState === 3) {
            data.email = false;
        }
        try {
            const response = await fetch("/api/account/changePassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (response.ok) {
                setLoginInfo("Password has been successfully changed");
                setRecoveryState(0);
            }
            else {
                setLoginInfo("Username or code is wrong");
                setRecoveryState(0);
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    }

    return (
        <div className="container">
            <h2 className="mt-4">Password Recovery</h2>
            <div className="col-md-6">
                {
                    (() => {
                        switch (recoveryState) {
                            case 0:
                                return (
                                    <form onSubmit={(e) => { e.preventDefault(); setRecoveryState(1);}} className="row g-3">
                                        <label htmlFor="loginIdentifier" className="form-label">Username:</label>
                                        <input
                                            type="text"
                                            className="form-control mt-0"
                                            id="loginIdentifier"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />

                                        <div className="col-12 mt-4">
                                            <button type="submit" className="btn btn-primary">Continue</button>
                                        </div>
                                        {loginInfo && <div className="col-md-12 alert alert-info">{loginInfo}</div>}

                                    </form>
                                );
                            case 1:
                                return (
                                    <div>
                                        <h5 className="mt-4">Choose method:</h5>
                                        <button className="btn btn-block btn-secondary mt-2 d-block" onClick={sendEmail} > Send code on e-mail</button>
                                        <button className="btn btn-block btn-secondary mt-2 d-block" onClick={use2FA} > Use 2FA code</button>
                                    </div>
                                );
                            case 2:
                            case 3:
                                return (
                                    <form onSubmit={(e) => { e.preventDefault();}}  className="row g-3">
                                        <label htmlFor="code" className="form-label">Code:</label>
                                        <input
                                            type="text"
                                            className="form-control mt-0"
                                            id="code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            required
                                        />

                                        <label htmlFor="password" className="form-label">New Password:</label>
                                        <input
                                            type="text"
                                            className="form-control mt-0"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />

                                        <div className="col-12 mt-4">
                                            <button className="btn btn-primary" onClick={changePassword} >Confirm</button>
                                        </div>
                                    </form>
                                );
                            default:
                                return null;
                        }
                    })()
                }
                <Link to="/" className="link d-inline-block mt-4 ">Press if you want return to login page</Link>
            </div>
        </div>
    );
};
export default PasswordRecovery;
