import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Chart1 from '../components/AccountTrafficChart';
import Chart2 from '../components/CategoriesChart';
import { showSuccessAlert, showFailedAlert, showWarningAlert } from '../components/ToastifyAlert';
import translation from "../assets/translation.json";

const DashboardPage = (props) => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const navigate = useNavigate();


    const checkBudget = async () => {
        try {
            const response = await fetch(`/api/budget/checkBudget`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.length > 0) {
                console.log("Budgets with negative balance:");
                console.log(data);
                data.forEach(budget => {
                    showWarningAlert(`Exceeded Budget!
                    Budget: ${budget.name}
                    Total Expenditure: ${budget.remainingBalance}
                    Category: ${budget.budgetCategoryName}`);
                });
            } else {
                console.log("No budgets have a negative total expenditure.");
            }
        } catch (error) {
            console.error('Error during checking budget:', error);
        }
    };
    useEffect(() => {
        if (user == null) {
            navigate("/");
        } else
            checkBudget();
    }, [navigate]);

    return (
        user !== null ?
            <div className='container'>
                <div className="mb-3">
                    <span className="fs-4"><strong>{translation[props.language].Dashboard.Greetings + user.username}!</strong></span>
                    <p className="mt-2"><em>{translation[props.language].Dashboard.Desc}</em></p>
                    <div className="row mt-5" style={{ gap: "0px" }}>
                        <Link to="/wallet" className="link col-sm-3" style={{ minWidth: "33%", margin: "0 0 5px 0" }}>
                            <div className="card background-my w-100 m-auto text-center">
                                <img className="icons" src='https://cdn-icons-png.flaticon.com/512/493/493389.png' alt="Wallet Icon" />
                                <span>{translation[props.language].Dashboard.Wallets}</span>
                            </div>
                        </Link>
                        <Link to="/import" className="link col-sm-3" style={{ minWidth: "33%", margin: "0 0 5px 0" }}>
                            <div className="card background-my m-auto text-center">
                                <img className="icons" src='https://cdn-icons-png.flaticon.com/128/4013/4013427.png' alt="Import Icon" />
                                <span>{translation[props.language].Dashboard.Import}</span>
                            </div>
                        </Link>
                        <Link to="/export" className="link col-sm-3" style={{ minWidth: "33%", margin: "0 0 5px 0" }}>
                            <div className="card background-my m-auto text-center">
                                <img className="icons" src='https://cdn-icons-png.flaticon.com/128/5859/5859742.png' alt="Export Icon" />
                                <span>{translation[props.language].Dashboard.Export}</span>
                            </div>
                        </Link>
                    </div>

                    <div className="row mt-5" style={{ gap: "0px" }}>
                        <Link to="/myReceipt" className="link col-sm-3" style={{ minWidth: "33%", margin: "0 0 5px 0" }}>
                            <div className="card background-my m-auto text-center">
                                <img className="icons" src='https://cdn-icons-png.flaticon.com/128/217/217905.png' alt="Receipt Icon" />
                                <span>{translation[props.language].Dashboard.Receipts}</span>
                            </div>
                        </Link>
                        <Link to="/account/settings/twoFactorAuthentication" className="link col-sm-3" style={{ minWidth: "33%", margin: "0 0 5px 0" }}>
                            <div className="card background-my w-100 m-auto text-center">
                                <img className="icons" src='https://cdn-icons-png.freepik.com/256/4448/4448933.png' alt="TwoFactor Icon" />
                                <span>{translation[props.language].Dashboard.TwoFactor}</span>
                            </div>
                        </Link>
                        <Link to="/report" className="link col-sm-3" style={{ minWidth: "33%", margin: "0 0 5px 0" }}>
                            <div className="card background-my m-auto text-center">
                                <img className="icons" src='https://cdn-icons-png.freepik.com/256/2912/2912773.png' alt="Reports Icon" />
                                <span>{translation[props.language].Dashboard.Report}</span>
                            </div>
                        </Link>
                    </div>

                    <div className="row mt-5" style={{ gap: "0px" }}>
                        <Link to="/budget" className="link col-sm-3" style={{ minWidth: "33%", margin: "0 0 5px 0" }}>
                            <div className="card background-my m-auto text-center">
                                <img className="icons" src='https://cdn-icons-png.freepik.com/512/11370/11370113.png' alt="Budget Icon" />
                                <span>{translation[props.language].Dashboard.Budget}</span>
                            </div>
                        </Link>
                        <Link to="/categories" className="link col-sm-3" style={{ minWidth: "33%", margin: "0 0 5px 0" }}>
                            <div className="card background-my m-auto text-center">
                                <img className="icons" src='https://cdn-icons-png.freepik.com/256/9309/9309662.png' alt="Categories Icon" />
                                <span>{translation[props.language].Dashboard.Categories}</span>
                            </div>
                        </Link>
                        <Link to="/profile" className="link col-sm-3" style={{ minWidth: "33%", margin: "0 0 5px 0" }}>
                            <div className="card background-my m-auto text-center">
                                <img className="icons" src='https://cdn-icons-png.freepik.com/256/1077/1077063.png' alt="Profile Icon" />
                                <span>{translation[props.language].Dashboard.Profile}</span>
                            </div>
                        </Link>
                    </div>
                    <div className="row">
                        <div className='col'>
                            <Chart1 language={props.language} />
                        </div>
                        <div className='col'>
                            <Chart2 language={props.language} />
                        </div>
                    </div>
                </div>
            </div>
            : <></>
    );
}

export default DashboardPage;
