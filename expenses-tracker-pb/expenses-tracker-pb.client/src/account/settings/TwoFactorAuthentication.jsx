import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import translation from "../../assets/translation.json";

const TwoFactorAuthentication = (props) => {

    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    // Authentication status
    const [googleAuthenticationStatus, setGoogleAuthenticationStatus] = useState(null);
    const [emailAuthenticationStatus, setEmailAuthenticationStatus] = useState(null);
    const [questionAuthenticationStatus, setQuestionAuthenticationStatus] = useState(null);

    // Authentication message
    const [alertMessage, setAlertMessage] = useState("");
    const [emailAuthenticationAlertMessage, setEmailAuthenticationAlertMessage] = useState("");
    const [questionAuthenticationAlertMessage, setQuestionAuthenticationAlertMessage] = useState("");

    const [googleAuthKey, setGoogleAuthKey] = useState('');
    const [securityQuestions, setSecurityQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    const disabledText = translation[props.language].TwoFactor.Disabled; 
    const enabledText = translation[props.language].TwoFactor.Enabled; 

    // Enable authentication functions
    const enableGoogleAuthentication = async (status) => {
        try {
            const enteredValue = document.getElementById('userAuthKey').value;

            const sendData = {
                authKey: googleAuthKey,
                enteredAuthKey: enteredValue
            };

            const response = await fetch('/api/account/enableTwoFactor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(sendData),
            });

            if (response.ok) {
                const data = await response.json();

                var displayDiv = document.createElement("div");
                displayDiv.setAttribute("role", "alert");

                if (data) {
                    setGoogleAuthenticationStatus(true);
                    updateStatusInfo(true);
                    displayDiv.classList.add("alert", "alert-success");
                    displayDiv.textContent = "Activated!";
                }
                else {
                    displayDiv.classList.add("alert", "alert-danger");
                    displayDiv.textContent = "Code is expired or wrong!";
                }
                var x = document.getElementById('activation-alert');
                x.innerHTML = "";
                x.appendChild(displayDiv);
            }
            else {
                throw new Error('Failed to update Two Factor Status');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const enableEmailAuthentication = async () => {
        try {
            const response = await fetch('/api/account/enableEmailAuthentication', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setEmailAuthenticationAlertMessage(data.message);

                setEmailAuthenticationStatus(true);
                updateEmailAuthenticationStatus(true);
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const enableQuestionAuthentication = async () => {
        try {


            const requestData = {
                securityQuestion: selectedQuestion,
                securityQuestionAnswer: answer
            };

            const response = await fetch('/api/account/enableSecurityQuestionAuthentication', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                const data = await response.json();
                setQuestionAuthenticationAlertMessage(data.message);

                setQuestionAuthenticationStatus(true);
                updateQuestionAuthenticationStatus(true);
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Disable authentication functions
    const disableGoogleAuthentication = async (status) => {
        try {
            const enteredValue = document.getElementById('userAuthKey').value;

            const sendData = {
                enteredAuthKey: enteredValue
            };

            const response = await fetch('/api/account/disableTwoFactor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(sendData),
            });

            if (response.ok) {
                const data = await response.json();

                var displayDiv = document.createElement("div");
                displayDiv.setAttribute("role", "alert");

                if (data) {
                    setGoogleAuthenticationStatus(false);
                    updateStatusInfo(false);
                    displayDiv.classList.add("alert", "alert-success");
                    displayDiv.textContent = "Disabled!";
                }
                else {
                    displayDiv.classList.add("alert", "alert-danger");
                    displayDiv.textContent = "Code is expired or wrong!";
                }
                var x = document.getElementById('activation-alert');
                x.innerHTML = "";

                x.appendChild(displayDiv);
                await fetchGoogleAuthenticationKey();
            }
            else {
                throw new Error('Failed to disable 2FA');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const disableEmailAuthentication = async () => {
        try {
            const emailAuthCode = document.getElementById('emailAuthCode').value;

            const data = {
                emailAuthenticationCode: emailAuthCode
            };

            const response = await fetch('/api/account/disableEmailAuthentication', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setEmailAuthenticationStatus(false);
                updateEmailAuthenticationStatus(false);
                const data = await response.json();
                setEmailAuthenticationAlertMessage(data.message);
            }
            else if (response.status === 401) {
                const data = await response.json();
                setEmailAuthenticationAlertMessage(data.message);
            }
            else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const disableQuestionAuthentication = async () => {
        try {


            const requestData = {
                securityQuestionAnswer: answer
            };

            const response = await fetch('/api/account/disableSecurityQuestionAuthentication', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                const data = await response.json();
                setQuestionAuthenticationAlertMessage(data.message);

                setQuestionAuthenticationStatus(false);
                updateQuestionAuthenticationStatus(false);
            } else {
                setQuestionAuthenticationAlertMessage(translation[props.language].TwoFactor.Incorrect);
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Update authentication status functions
    const updateGoogleAuthenticationStatus = (status) => {
        const spinner = document.querySelector('.status-info .spinner-border');
        if (status != null) {
            if (spinner)
                spinner.remove();

            if (status === true) {
                document.getElementsByClassName('status-info')[0].innerHTML = `<div class=\"h5 text-success\">${enabledText}</div>`;
            }
            else if (status === false) {
                document.getElementsByClassName('status-info')[0].innerHTML = `<div class=\"h5 text-danger\">${disabledText}</div>`;
            }
        }
    };
    const updateEmailAuthenticationStatus = (status) => {
        const spinner = document.querySelector('.status-info .spinner-border');
        if (status != null) {
            if (spinner)
                spinner.remove();

            if (status === true) {
                document.getElementsByClassName('email-authentication-status-info')[0].innerHTML = `<div class=\"h5 text-success\">${enabledText}</div>`;
            }
            else if (status === false) {
                document.getElementsByClassName('email-authentication-status-info')[0].innerHTML = `<div class=\"h5 text-danger\">${disabledText}</div>`;
            }
        }
    };
    const updateQuestionAuthenticationStatus = (status) => {
        const spinner = document.querySelector('.status-info .spinner-border');
        if (status != null) {
            if (spinner)
                spinner.remove();

            if (status === true) {
                document.getElementsByClassName('question-authentication-status-info')[0].innerHTML = `<div class=\"h5 text-success\">${enabledText}</div>`;
            }
            else if (status === false) {
                document.getElementsByClassName('question-authentication-status-info')[0].innerHTML = `<div class=\"h5 text-danger\">${disabledText}</div>`;
            }
        }
    };

    // Fetch functions
    const fetchGoogleAuthenticationStatus = async () => {
        try {
            const response = await fetch('/api/account/GetTwoFactorStatus', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();

                setGoogleAuthenticationStatus(data.twoFactorEnabled);
                updateGoogleAuthenticationStatus(data.twoFactorEnabled);
                if (!data.twoFactorEnabled) {
                    await fetchGoogleAuthenticationKey();
                }
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const fetchEmailAuthenticationStatus = async () => {
        try {
            const response = await fetch('/api/account/getEmailAuthenticationStatus', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setEmailAuthenticationStatus(data.emailAuthentication);
                updateEmailAuthenticationStatus(data.emailAuthentication);
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const fetchQuestionAuthenticationStatus = async () => {
        try {
            const response = await fetch('/api/account/getSecurityQuestionsStatus', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setQuestionAuthenticationStatus(data.securityQuestionStatus);
                updateQuestionAuthenticationStatus(data.securityQuestionStatus);

                if (data.securityQuestionStatus) {
                    fetchUserSecurityQuestion();
                }
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const fetchGoogleAuthenticationKey = async () => {
        try {
            const response = await fetch('/api/account/GetTwoFactorKey', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('QR_image').src = data.barcodeImageUrl;
                document.querySelector('.figure-caption').textContent = "Key: " + data.authKey;
                setGoogleAuthKey(data.authKey);
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const fetchSecurityQuestions = async () => {
        try {
            const response = await fetch('/api/account/getSecurityQuestions', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setSecurityQuestions(data);
            } else {
                throw new Error('Failed to fetch data');
            }

            
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    const fetchUserSecurityQuestion = async () => {
        try {
            const response = await fetch('/api/account/getUserSecurityQuestion', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setSelectedQuestion(data.securityQuestion);
            } else {
                throw new Error('Failed to fetch data');
            }


        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Other
    const sendEmailAuthenticationCode = async () => {
        try {
            const response = await fetch('/api/account/sendEmailAuthenticationCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setEmailAuthenticationAlertMessage(data.message);
                console.log(data.message);
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const handleSelectChange = (event) => {
        setSelectedQuestion(event.target.value);
    };
    const handleInputChange = (event) => {
        setAnswer(event.target.value);
    };

    useEffect(() => {
        const checkUserLogin = async () => {
            try {
                const response = await fetch("/api/account/user", {
                    method: "POST",
                    credentials: "include",
                });

                if (response.ok) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                    setAlertMessage("You are not logged in. Redirecting to login page...");
                }
            } catch (error) {
                console.error("Error checking user login:", error);
            }
        };
        checkUserLogin();
        fetchGoogleAuthenticationStatus();
        fetchEmailAuthenticationStatus();
        fetchQuestionAuthenticationStatus();
        fetchSecurityQuestions();
    }, [navigate]);
    useEffect(() => {
        if (!isLoggedIn) {
            const timeout = setTimeout(() => {
                navigate("/");
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [isLoggedIn, navigate]);

    return (
        <div className="container mt-5">
            {/* Header */}
            <div className="row text-center">
                <h1>{translation[props.language].TwoFactor.TwoFactor}</h1>
            </div>  <hr></hr>

            {/* Google Authentication */}
            <div className="row">
                <h2>Google Authenticator</h2>
            </div> <hr style={{ border: "1px dashed black" }}></hr>
            <div className="row mb-2">
                <div className="col h4">
                    Status
                </div>
                <div className="col-8 status-info">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">{translation[props.language].TwoFactor.Loading}</span>
                    </div>
                </div>
            </div> <hr style={{ border: "1px dashed black" }}></hr>
            {!googleAuthenticationStatus ? (
                <div className="row mb-2">
                    <div className="col-2">
                        <img src="" className="img-fluid" alt="QR Code" id="QR_image"></img>
                        <figcaption className="figure-caption text-center"></figcaption>
                    </div>
                    <div className="col-10 align-items-center">
                        <h4>{translation[props.language].TwoFactor.HowTo}</h4>
                        <ol>
                            <li>{translation[props.language].TwoFactor.HowToLine1}</li>
                            <li>{translation[props.language].TwoFactor.HowToLine2}</li>
                            <li>{translation[props.language].TwoFactor.HowToLine3}</li>
                        </ol>
                    </div>
                </div>
            ) : (
                <div className="row mb-2">
                        <div>
                            <p>{translation[props.language].TwoFactor.CurrentlyActive}</p>
                            <p>{translation[props.language].TwoFactor.FollowSteps}</p>
                        <ol>
                                <li>{translation[props.language].TwoFactor.FollowStepsQR1}</li>
                                <li>{translation[props.language].TwoFactor.FollowStepsQR2}</li>
                        </ol>
                    </div>
                </div>
            )}
            <div className="row mt-4">
                <div className="col h4">
                    <input type="number" className="form-control" placeholder={translation[props.language].TwoFactor.EnterDigit} id="userAuthKey" maxLength="6"></input>
                </div>
                <div className="col-8 status-info">
                    <input className="btn btn-dark" type="button" value={!googleAuthenticationStatus ? (translation[props.language].TwoFactor.Enable) : (translation[props.language].TwoFactor.Disable)} onClick={!googleAuthenticationStatus ? (enableGoogleAuthentication) : (disableGoogleAuthentication)}></input>
                </div>
            </div>
            <div className="row mt-4" id="activation-alert">
            </div>
            {!isLoggedIn && alertMessage !== "" && (
                <div className="alert alert-danger" role="alert">
                    {alertMessage}
                </div>
            )}
            <hr></hr>

            {/* Email Authentication */}
            <div className="row">
                <h2>Email</h2>
            </div> <hr style={{ border: "1px dashed black" }}></hr>
            <div className="row mb-2">
                <div className="col h4">
                    Status
                </div>
                <div className="col-8 email-authentication-status-info">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">{translation[props.language].TwoFactor.Loading}</span>
                    </div>
                </div>
            </div> <hr style={{ border: "1px dashed black" }}></hr>

            {!emailAuthenticationStatus ? (
                ""
            ) : (
                <div className="row mb-2">
                    <div>
                            <p>{translation[props.language].TwoFactor.CurrentlyActive}</p>
                            <p>{translation[props.language].TwoFactor.FollowSteps}</p>
                        <ol>
                                <li>{translation[props.language].TwoFactor.FollowStepsEmail1}</li>
                                <li>{translation[props.language].TwoFactor.FollowStepsEmail2}</li>
                        </ol>
                    </div>
                </div>
            )}

            <div className="row mt-4">
                {emailAuthenticationStatus ? (
                    <div className="col h4">
                        <input type="text" className="form-control" placeholder={translation[props.language].TwoFactor.EnterCode} id="emailAuthCode"></input>
                    </div>
                ) :
                    ("")
                }
                <div className="col-8 status-info">
                    <input className="btn btn-dark" type="button" value={!emailAuthenticationStatus ? (translation[props.language].TwoFactor.Enable) : (translation[props.language].TwoFactor.Disable)} onClick={!emailAuthenticationStatus ? (enableEmailAuthentication) : (disableEmailAuthentication)}></input>
                    <input className="btn btn-dark m-2" type="button" value={translation[props.language].TwoFactor.SendCode} onClick={(sendEmailAuthenticationCode)}></input>
                </div>
            </div>
            <div className="row mt-4" id="activation-alert">
            </div>
            {emailAuthenticationAlertMessage !== "" && (
                <div className="alert alert-info" role="alert">
                    {emailAuthenticationAlertMessage}
                </div>
            )}
            {/* Security Question Authentication */}
            
            <div className="row">
                <h2>{translation[props.language].TwoFactor.SecurityQ}</h2>
            </div> <hr style={{ border: "1px dashed black" }}></hr>
            <div className="row mb-2">
                <div className="col h4">
                    Status
                </div>
                <div className="col-8 question-authentication-status-info">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">{translation[props.language].TwoFactor.Loading}</span>
                    </div>
                </div>
            </div> <hr style={{ border: "1px dashed black" }}></hr>

            {!questionAuthenticationStatus && (
            <select className="form-select" value={selectedQuestion} onChange={handleSelectChange}>
                    <option value="">{translation[props.language].TwoFactor.SelectQ}</option>
                {securityQuestions.map((item) => (
                    <option key={item.id} value={item.question}>{item.question}</option>
                ))}
            </select>
            )}

            {selectedQuestion && (
                <div className="mt-3">
                    <label htmlFor="answer" className="form-label">{selectedQuestion}</label>
                    <input type="text" className="form-control" id="answer" value={answer} onChange={handleInputChange} />
                </div>
            )}


            <div className="col-8 mt-3 mb-2 status-info">
                <input className="btn btn-dark" type="button" value={!questionAuthenticationStatus ? (translation[props.language].TwoFactor.Enable) : (translation[props.language].TwoFactor.Disable)} onClick={!questionAuthenticationStatus ? (enableQuestionAuthentication) : (disableQuestionAuthentication)}></input>
            </div>

            {questionAuthenticationAlertMessage !== "" && (
                <div className="alert alert-info" role="alert">
                    {questionAuthenticationAlertMessage}
                </div>
            )}
        </div>
    );
};

export default TwoFactorAuthentication;