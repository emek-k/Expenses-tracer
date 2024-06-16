import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import Modal from 'react-modal';
import './../styles/Site.css';
import translation from './../assets/translation.json'

const RootElement = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const isUserLogged = localStorage.getItem('token') !== null;
    const [obligationsAlertMessage, setObligationsAlertMessage] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token) {
            setUser({ token });
        }


        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
        }
    }, []);

    const renderProfile = () => {
        if (!user) {
            const savedUser = localStorage.getItem('user');

            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            }
        }

        return (
            <div className="navbar-profile">
                {user?.profilePicture ? (
                    <img src={`data:image/jpeg;base64,${user.profilePicture}`} alt="Profile" className="navbar-profile-img" />
                ) : (
                    <img src="https://img.redro.pl/fototapety/ikona-wektor-profilu-uzytkownika-700-146325654.jpg" alt="Default Profile" className="navbar-profile-img" key="profile-image"/>
                )}
            </div>
        );
    };


    const handleNotifyClick = async () => {
        try {
            const responseWallets = await fetch('/api/account/getWallets');
            if (!responseWallets.ok) {
                throw new Error('Failed to fetch wallets');
            }
            const walletsData = await responseWallets.json();
            const currentDate = new Date();
            let alertMessage = '';

            for (const wallet of walletsData) {
                const responseObligations = await fetch(`/api/obligation/getObligations/${wallet.id}`);
                if (!responseObligations.ok) {
                    console.error(`Failed to fetch obligations for wallet ${wallet.id}`);
                    continue;
                }
                const obligationsData = await responseObligations.json();

                obligationsData.sort((a, b) => {
                    const dueDateA = new Date(a.dueDate);
                    const dueDateB = new Date(b.dueDate);
                    const diffTimeA = dueDateA.getTime() - currentDate.getTime();
                    const diffTimeB = dueDateB.getTime() - currentDate.getTime();
                    const diffDaysA = Math.ceil(diffTimeA / (1000 * 60 * 60 * 24));
                    const diffDaysB = Math.ceil(diffTimeB / (1000 * 60 * 60 * 24));
                    return diffDaysA - diffDaysB;
                });

                obligationsData.forEach(obligation => {
                    const dueDate = new Date(obligation.dueDate);
                    const diffTime = dueDate.getTime() - currentDate.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays >= 0) {
                        alertMessage += `Wallet ID: ${wallet.id}, Wallet Name: ${wallet.name}, Obligation Name: ${obligation.name}, Days until Due: ${diffDays}\n`;
                    }
                });
            }

            setObligationsAlertMessage(alertMessage);

            if (alertMessage) {
                setModalIsOpen(true);
            } else {
                setModalIsOpen(true);
                alertMessage = 'No obligations with upcoming due dates found.';
                setObligationsAlertMessage(alertMessage);
            }
        } catch (error) {
            console.error('Error fetching obligations:', error.message);
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        const response = await fetch('/api/account/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });
        if (!response.ok) {
            console.info(response.message);
        }

        setUser(null);
        navigate("/");
    };
    const navbarLang = translation[props.language]?.Navbar;

    function btnclick(lang) {
        switch (lang) {
            case "English":
                props.setLanguage("English");
                break;
            case "Polish":
                props.setLanguage("Polish");
                break;
        }
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark w-100">
            <div className="container">
                <Link className="navbar-brand" to={isUserLogged ? "/dashboard" : "/"}>Expenses tracker</Link>
                <button className="navbar-toggler d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapsibleNavId" aria-controls="collapsibleNavId"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="collapsibleNavId">
                    <ul className="navbar-nav me-auto mt-2 mt-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/dashboard" aria-current="page">{navbarLang?.Home}<span className="visually-hidden">(current)</span></Link>
                        </li>
                    </ul>) :
                    {isUserLogged ? (
                        <>
                            <ul className="navbar-nav navbar-nav__profile-button">
                                <li className="nav-item">
                                    <button className="nav-link" onClick={handleNotifyClick}><i className="bi bi-bell-fill"></i></button>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/profile">
                                        {user && user.firstName ? user.firstName : "Profile"}
                                    </Link>
                                </li>
                            </ul>
                            {renderProfile()}
                            <button className="btn btn-outline-light" onClick={() => handleLogout()}>{translation[props.language]?.Utils.Logout}</button>
                        </>
                    ) : null}
                    <button className="btn btn-outline-light w-auto mx-2" data-bs-toggle="modal" data-bs-target="#languageModal">{translation[props.language]?.Utils.Language}</button>
                </div>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Notifications Modal"
                className="notification-modal"
            >
                <h2>{translation[props.language]?.Navbar.Modal.Title}</h2>
                {obligationsAlertMessage.trim().split('\n').map((line, index) => {
                    const elements = line.split(', ');
                    if (elements.length >= 4) {
                        const walletId = elements[0].split(': ')[1];
                        const walletName = elements[1].split(': ')[1];
                        const obligationName = elements[2].split(': ')[1];
                        const daysUntilDue = elements[3].split(': ')[1];
                        const isDueSoon = parseInt(daysUntilDue) < 7;
                        return (
                            <div key={index} className="notification-block-container">
                                <div className="notification-block">
                                    <span><span className="bold-label">Wallet:</span> {walletName} <span className="bold-label">Name:</span> {obligationName} <span className="bold-label">Days until Due:</span> <span className={isDueSoon ? 'red-bold' : ''}>{daysUntilDue}</span></span>
                                </div>
                                <div className="button-container">
                                    <button className="btn btn-primary" onClick={() => { navigate(`/obligation/${walletId}`); setModalIsOpen(false); }}><i className="bi bi-search"></i></button>
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <React.Fragment key={index}>
                                No obligations with upcoming due dates found.
                            </React.Fragment>
                        );
                    }
                })}
                <button className="btn btn-danger" onClick={() => setModalIsOpen(false)}>{translation[props.language]?.Utils.ButtonClose}</button>
            </Modal>
            <div className="modal fade" id="languageModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{translation[props.language]?.Utils.ChooseLang}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex align-items-center justify-content-center">
                                <button className="btn btn-primary mx-2" onClick={() => btnclick("Polish")}>Polski</button>
                                <button className="btn btn-primary mx-2" onClick={() => btnclick("English")}>English</button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">{translation[props.language]?.Utils.ButtonClose}</button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default RootElement;
