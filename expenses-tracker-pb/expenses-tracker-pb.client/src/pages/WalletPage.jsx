import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Site.css";
import translation from "../assets/translation.json";

const WalletPage = (props) => {
    const [walletName, setWalletName] = useState("");
    const [walletFormError, setWalletFormError] = useState("");
    const [wallets, setWallets] = useState([]);
    const navigate = useNavigate();
    let deleteMode = false;
    let editMode = false;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;


    useEffect(() => {
        const checkUserLogin = async () => {
            try {
                const response = await fetch("/api/transaction/user", {
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
    }, [navigate]);

    useEffect(() => {
        if (!isLoggedIn) {
            const timeout = setTimeout(() => {
                navigate("/");
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [isLoggedIn, navigate]);

    const handleWalletClick = async (walletId) => {
        if (deleteMode) {
            document.getElementById("jd").setAttribute("hidden", true);
            if (window.confirm(translation[props.language].WalletPage.DeleteConfirm)) {
                let response = await fetch("/api/account/removeWallet/" + walletId, {
                    method: "DELETE",
                    headers: {
                        "content-type": "application/json",
                    },
                    credentials: "include",
                });
                if (response.ok) {
                    fetchWallets();
                } else console.error("Error deleting wallet" + response.json);
            }
            deleteMode = false;
        } else if (editMode) {
            document.getElementById("jd").setAttribute("hidden", true);
            editMode = false;
            let newName = window.prompt(translation[props.language].WalletPage.ChooseName, "");
            if (!newName == null || !newName == "") {
                if (
                    window.confirm(
                        translation[props.language].WalletPage.NameConfirm +
                        newName +
                        "?"
                    )
                ) {
                    const response = await fetch(`/api/account/updateWallet/${walletId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify(newName),
                    });
                    if (response.ok) {
                        fetchWallets();
                    }
                }
            }
        } else navigate(`/wallet/actions/${walletId}`);
    };

    const fetchWallets = async () => {
        try {
            const response = await fetch("/api/account/getWallets", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (response.ok) {
                const walletData = await response.json();
                setWallets(walletData);
            } else {
                console.error(response);
                setWalletFormError("Error fetching wallets");
            }
        } catch (error) {
            console.error("Error during fetching wallets", error);
            setWalletFormError("Error fetching wallets");
        }
    };

    useEffect(() => {
        fetchWallets();
    }, []); 

    const submitNewWallet = async (e) => {
        e.preventDefault();

        try {
            const cred = {
                name: walletName,
            };
            const response = await fetch("/api/account/addWallet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(cred),
            });
            if (response.ok) {
                setWalletName("");
                fetchWallets();
            } else {
                console.error(response);
                setWalletFormError("Invalid form data");
            }
        } catch (error) {
            console.error("Error during adding wallet", error);
            setWalletFormError("Error during adding wallet");
        }
    };

    return (
        <div className="container mt-3">
            <div className="d-flex justify-content-center">
                <button
                    className="btn btn-secondary mx-1 mh-50 w-25"
                    onClick={() => {
                        deleteMode = !deleteMode;
                        editMode = false;
                        document.getElementById("jdH1").textContent =
                            translation[props.language].WalletPage.DeleteChoose;
                        const jd = document.getElementById("jd");
                        if (deleteMode && jd.hasAttribute("hidden")) {
                            jd.removeAttribute("hidden");
                        } else if (!deleteMode && !jd.hasAttribute("hidden")) {
                            jd.setAttribute("hidden", "true");
                        }
                    }}
                >
                    {translation[props.language].WalletPage.DeleteWallet}
                </button>
                <button
                    className="btn btn-secondary mx-1 mh-50 w-25"
                    onClick={() => {
                        editMode = !editMode;
                        deleteMode = false;
                        document.getElementById("jdH1").textContent =
                            translation[props.language].WalletPage.EditSelect;
                        const jd = document.getElementById("jd");
                        if (editMode && jd.hasAttribute("hidden")) {
                            jd.removeAttribute("hidden");
                        } else if (!editMode && !jd.hasAttribute("hidden")) {
                            jd.setAttribute("hidden", "true");
                        }
                    }}
                >
                    {translation[props.language].WalletPage.EditWallet}
                </button>
            </div>
            <div id="jd" hidden={true}>
                <h1 id="jdH1"></h1>
            </div>
            <div className="row my-3">
                {wallets.map((wallet, i) => (
                    <div key={i} className="col my-2" style={{ minWidth: "30%" }}>
                        <div
                            onClick={() => handleWalletClick(wallet.id)}
                            className="card h-100 w-100 text-center m-auto"
                        >
                            <img
                                className="icons"
                                src="https://cdn-icons-png.flaticon.com/512/493/493389.png"
                                alt={`icon-${i}`}
                            />
                            <p
                                className="w-50"
                                style={{ marginBottom: "0", paddingBottom: "0" }}
                            >
                                {wallet.name}
                            </p>
                            <p>{wallet.accountBalance} PLN</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="card w-50 h-auto m-auto mb-5 p-3 pt-3">
                <form onSubmit={submitNewWallet} className="row w-100 g-3">
                    <h5>{translation[props.language].WalletPage.AddWallet}</h5>

                    <input
                        type="text"
                        className="form-control"
                        id="walletName"
                        value={walletName}
                        onChange={(e) => setWalletName(e.target.value)}
                        placeholder={translation[props.language].WalletPage.AddPlaceholder}
                        required
                    />
                    {walletFormError && (
                        <div className="col-md-12 error">{walletFormError}</div>
                    )}
                    <button type="submit" className="btn btn-primary col-12">
                        {translation[props.language].WalletPage.AddButton}
                    </button>
                </form>
            </div>
            {!isLoggedIn && alertMessage !== "" && (
                <div className="alert alert-danger" role="alert">
                    {alertMessage}
                </div>
            )}
        </div>
    );
};

export default WalletPage;