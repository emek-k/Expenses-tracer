import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import translation from "../assets/translation.json";

const ProfilePage = (props) => {
    const [userData, setUserData] = useState({
        user: {
            firstName: '',
            lastName: '',
            userName: '',
            email: '',
            password: '******',
            emailTwoFactorAuthenticationEnabled: false,
            googleAuthKey: null,
            securityQuestionAnswer: null,
        },
        logins: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const navigate = useNavigate();
    const [confirmation, setConfirmation] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);


    const handleConfitmationChange = (e) => {
        setConfirmation(e.target.value);
    };

    useEffect(() => {
        fetchUserData();
        checkUserLogin();
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            setAlertMessage("You are not logged in. Redirecting to login page...");
            const redirectTimer = setTimeout(() => {
                navigate("/");
            }, 3000);

            return () => clearTimeout(redirectTimer);
        }
    }, [isLoggedIn, navigate]);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/account/GetProfilePageData', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            data.user.password = '******';
            setUserData(data);

            console.log(data);

            setProfilePicture(data.profilePicture);

            console.log(profilePicture);

        } catch (error) {
            console.error('Error during fetching user data:', error);
        }
    };

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
            }
        } catch (error) {
            console.error("Error checking user login:", error);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        fetchUserData();
    };

    const handleSaveClick = async () => {
        setValidationErrors({});
        try {
            const validationErrors = validateUserData();
            if (Object.keys(validationErrors).length > 0) {
                setValidationErrors(validationErrors);
                return;
            }

            setIsEditing(false);
            setValidationErrors({});

            const response = await fetch('/api/account/UpdateProfilePageData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userData.user.id,
                    firstName: userData.user.firstName,
                    lastName: userData.user.lastName,
                    userName: userData.user.userName,
                    email: userData.user.email,
                    password: userData.user.password
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save data');
            }

            fetchUserData();
        } catch (error) {
            console.error('Error during saving user data:', error);
        }
    };

    const handleCancelClick = async () => {
        setIsEditing(false);
        fetchUserData();
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserData((prevUserData) => ({
            ...prevUserData,
            user: {
                ...prevUserData.user,
                [name]: type === 'checkbox' ? checked : value,
            },
        }));
    };

    const validateUserData = () => {
        const errors = {};

        if (!userData.user.firstName.trim()) {
            errors.firstName = translation[props.language].Profile.ValFirst;
        }

        if (!userData.user.lastName.trim()) {
            errors.lastName = translation[props.language].Profile.ValLast;
        }

        if (!userData.user.userName.trim()) {
            errors.userName = translation[props.language].Profile.ValUsername;
        }

        if (!userData.user.email.trim()) {
            errors.email = translation[props.language].Profile.ValEmail;
        } else if (!isValidEmail(userData.user.email)) {
            errors.email = translation[props.language].Profile.InvalidEmail;
        }

        if (!userData.user.password.trim()) {
            errors.password = translation[props.language].Profile.ValPassword;
        } else if (!isValidPassword(userData.user.password)) {
            errors.password = translation[props.language].Profile.InvalidPassword;
        }

        if (userData.user.password != confirmation) {
            errors.confirmation = translation[props.language].Profile.ValSamePass;
        }

        return errors;
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPassword = (password) => {
        if (password.length < 8) {
            return false;
        } else if (!/[A-Z]/.test(password)) {
            return false;
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return false;
        }
        else if (!/[0-9]/.test(password)) {
            return false;
        }
        
        return true;
    };

    const checkPasswordComplexity = () => {
        const complexityRules = [
            { condition: userData.user.password.length >= 8, message: translation[props.language].Profile.EightChar },
            { condition: /[A-Z]/.test(userData.user.password), message: translation[props.language].Profile.BigLetter },
            { condition: /[0-9]/.test(userData.user.password), message: translation[props.language].Profile.Number },
            { condition: /[!@#$%^&*(),.?":{}|<>]/.test(userData.user.password), message: translation[props.language].Profile.Special },
        ];

        return complexityRules.map((rule, index) => (
            <li key={index} style={{ color: rule.condition ? '#26bf1b' : '#f30000' }}>
                {rule.message}{index !== complexityRules.length - 1 && ", "}
            </li>
        ));
    };

    const handleFileChange = (event) => {
        setPhotoFile(event.target.files[0]);
    }

    const handleAddPhotoClick = async () => {
        if(!photoFile) {
            alert(translation[props.language].Profile.Warning);
            return;
        }

        const formData = new FormData();
        formData.append("file", photoFile);


        try {
            const response = await fetch('/api/account/upload-photo', {
                method: 'POST',
                body: formData,
            });


            if (!response.ok) {
                const errorText = await response.text();  
                console.error('Response Error:', errorText);  
                throw new Error('Failed to upload photo');
            }
            alert(translation[props.language].Profile.SuccessPhoto);
        } catch (error) {
            console.error('Error during photo upload:', error);
            alert(translation[props.language].Profile.Error);
        }
    };

    return (
        <div className="container">
            {isLoggedIn ? (
                <>
                    <h2 className="mt-4">{translation[props.language].Profile.Account}</h2>
                    <div className="profile__component">
                        <div className="profile__component__grid">
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                            <label>{translation[props.language].Profile.First}</label>
                                    </td>
                                    <td>
                                            <label>{translation[props.language].Profile.Last}</label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    className="form-control"
                                                    value={userData.user.firstName}
                                                    onChange={handleInputChange}
                                                />
                                                <div className="error">{validationErrors.firstName}</div>
                                            </>
                                        ) : (
                                            userData.user.firstName
                                        )}
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    className="form-control"
                                                    value={userData.user.lastName}
                                                    onChange={handleInputChange}
                                                />
                                                <div className="error">{validationErrors.lastName}</div>
                                            </>
                                        ) : (
                                            userData.user.lastName
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                            <label>{translation[props.language].Profile.Username}</label>
                                    </td>
                                    <td>
                                        <label>Email:</label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {isEditing ? (
                                            <>
                                                {userData.user.userName}
                                            </>
                                        ) : (
                                            userData.user.userName
                                        )}
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <>
                                                {userData.user.email}
                                            </>
                                        ) : (
                                            userData.user.email
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                            <label>{translation[props.language].Profile.Password}</label>
                                    </td>
                                    <td>
                                            <label>{translation[props.language].Profile.TwoFactor}</label>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    className="form-control"
                                                    value={userData.user.password}
                                                    onChange={handleInputChange}
                                                />
                                                <div className="error">{validationErrors.password}</div>
                                                <ul>{checkPasswordComplexity()}</ul>
                                            </>
                                        ) : (
                                            userData.user.password
                                        )}
                                    </td>
                                    <td>
                                            {userData.user.emailTwoFactorAuthenticationEnabled === false && userData.user.googleAuthKey === null && userData.user.securityQuestionAnswer === null ? translation[props.language].Profile.No : translation[props.language].Profile.Yes}

                                     </td>
                                        
                                </tr>
                                <tr>
                                    <td>
                                        {isEditing ? (
                                            <>
                                                    <label>{translation[props.language].Profile.ConfirmPass}</label>
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                    </td>
                                    <td>
                                        
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    id="confirmation"
                                                    value={confirmation}
                                                    onChange={handleConfitmationChange}
                                                />
                                                <div className="error">{validationErrors.confirmation}</div>
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <div className="edit-button-container">
                                                <input type="file" onChange={handleFileChange} />
                                                    <button className="btn btn-primary" onClick={handleAddPhotoClick}>{translation[props.language].Profile.AddPhoto}</button>
                                            </div>
                                        ) : (
                                            <></>
                                        )}        
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        {isEditing ? (
                            <div className="edit-button-container">
                                    <button className="btn btn-primary" onClick={handleSaveClick}>{translation[props.language].Profile.Save}</button>
                                    <button id="cancelBtn" className="btn btn-primary" onClick={handleCancelClick}>{translation[props.language].Profile.Cancel}</button>
                            </div>
                        ) : (
                            <div className="edit-button-container">
                                        <button className="btn btn-primary" onClick={handleEditClick}>{translation[props.language].Profile.Edit}</button>
                            </div>
                        )}
                        
                        </div>
                        <div>
                            <img src={"data:image/jpeg;base64," + userData.user.profilePicture} alt="Profile" style={{ width: '140px', height: 'auto' }} />
                        </div>
                    </div>
                </>
            ) : (
                    <div className="alert alert-danger" style={{ marginTop: "20px" }} role="alert">
                    {alertMessage}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;