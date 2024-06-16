import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { showSuccessAlert, showFailedAlert, showWarningAlert } from "../components/ToastifyAlert";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReCAPTCHA from "react-google-recaptcha";
import translation from "../assets/translation.json";

const RegisterForm = (props) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmationError, setConfirmationError] = useState("");
    const [registerError, setRegisterError] = useState("");
    const [recaptchaBool, setRecaptchaBool] = useState(null);
    const navigate = useNavigate();

    const handleConfitmationChange = (e) => {
        setConfirmation(e.target.value);
        setConfirmationError("");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setPasswordError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let valid = true;

        if (!password) {
            setPasswordError(translation[props.language].Profile.PassError);
            valid = false;
        } else if (password.length < 8) {
            setPasswordError(translation[props.language].Profile.EightChar);
            valid = false;
        } else if (!/[A-Z]/.test(password)) {
            setPasswordError(translation[props.language].Profile.BigLetter);
            valid = false;
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setPasswordError(translation[props.language].Profile.Special);
            valid = false;
        } else if (!/[0-9]/.test(password)) {
            setPasswordError(translation[props.language].Profile.Number);
            valid = false;
        } else if (password != confirmation) {
            setConfirmationError(translation[props.language].Profile.ValSamePass);
            valid = false;
        } else {
            setPasswordError("");
        }

        const userData = {
            firstName,
            lastName,
            userName,
            email,
            password,
        };
        if (valid && recaptchaBool) {
            try {
                const response = await fetch("/api/account/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userData),
                });

                if (response.ok) {
                    showSuccessAlert(translation[props.language].Profile.RegSuccess);
                    showWarningAlert(translation[props.language].Profile.Redirect);
                    setTimeout(() => {
                        navigate("/");
                    }, 2000);
                } else {
                    setRegisterError(translation[props.language].Profile.RegError);
                    showFailedAlert(translation[props.language].Profile.RegError);
                }
            } catch (error) {
                console.error("Error during registration", error);
                showFailedAlert(translation[props.language].Profile.RegError);
            }
        } else {
            setRegisterError("Captcha is required");
            showFailedAlert(translation[props.language].Profile.RegError);
        }
    };

    const checkPasswordComplexity = () => {
        const complexityRules = [
            { condition: password.length >= 8, message: translation[props.language].Profile.EightChar },
            { condition: /[A-Z]/.test(password), message: translation[props.language].Profile.BigLetter },
            { condition: /[0-9]/.test(password), message: translation[props.language].Profile.Number },
            { condition: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: translation[props.language].Profile.Special },
        ];

        return complexityRules.map((rule, index) => (
            <li key={index} style={{ color: rule.condition ? '#26bf1b' : '#f30000' }}>
                {rule.message}{index !== complexityRules.length - 1 && ", "}
            </li>
        ));
    };

    return (
        <div className="container">
            <h2 className="mt-4">{translation[props.language].Profile.Reg}</h2>
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="firstName" className="form-label">
                            {translation[props.language].Profile.First}
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="lastName" className="form-label">
                            {translation[props.language].Profile.Last}
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="userName" className="form-label">
                            {translation[props.language].Profile.Username}
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="userName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">
                            Email:
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="password" className="form-label">
                            {translation[props.language].Profile.Password}
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        {passwordError && <p className="error">{passwordError}</p>}
                        {translation[props.language].Profile.PassComplex}
                        <ul>{checkPasswordComplexity()}</ul>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="password" className="form-label">
                            {translation[props.language].Profile.ConfirmPass}
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmation"
                            value={confirmation}
                            onChange={handleConfitmationChange}
                            required
                        />
                        {confirmationError && <div className="error">{confirmationError}</div>}
                    </div>
                </div>
                <ReCAPTCHA
                    sitekey="6LdsQ5QpAAAAACF9OHbk3YzH0DHAc2urwHtKsJTI"
                    onChange={(val) => setRecaptchaBool(val)}
                    className="mb-2"
                />
                <button disabled={!recaptchaBool} type="submit" className="btn btn-primary">
                    {translation[props.language].Profile.SignUp}
                </button>
                <p>{registerError}</p>
            </form>
        </div>
    );
};

export default RegisterForm;