import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TransactionForm from "../components/TransactionForm";
import { useNavigate } from "react-router-dom";

import { showSuccessAlert, showFailedAlert } from "../components/ToastifyAlert";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TransactionsChart from "../components/TransactionsChart";
import ExpensesChart from "../components/ExpensesChart";
import translation from "../assets/translation.json";



const TransactionList = (props) => {
    const [transactions, setTransactions] = useState([]);
    const [transactionType, setTransactionType] = useState("all");
    const [categories, setCategories] = useState([]);
    const [startingDate, setStartingDate] = useState(null);
    const [endingDate, setEndingDate] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [minValue, setMinValue] = useState(null);
    const [maxValue, setMaxValue] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [addedTransaction, setAddedTransaction] = useState(null);
    const [transaction, setTransaction] = useState(null);
    const [walletName, setWalletName] = useState(null);
    const { walletId } = useParams();
    const [showFilters, setShowFilters] = useState(false);
    const [containsString, setContainsString] = useState(null);
    const [caseSensitive, setCaseSensitive] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [showChart, setShowChart] = useState(true);
    const navigate = useNavigate();
    const totalIncomes = transactions.filter(transaction => transaction.TransactionType === "income").reduce((total, transaction) => total + transaction.Amount, 0);
    const totalExpenditures = transactions.filter(transaction => transaction.TransactionType === "expenditure").reduce((total, transaction) => total + transaction.Amount, 0);
    const remainingAmount = totalIncomes - totalExpenditures;

    const handleToggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name !== "CategoryId") {
            setTransaction((transaction) => ({
                ...transaction,
                [name]: value,
            }));
        } else
            setTransaction((transaction) => ({
                ...transaction,
                [name]: Number.parseInt(value),
            }));
    };

    const handleStartingDateChange = (event) => {
        setStartingDate(event.target.value);
    };

    const handleEndingDateChange = (event) => {
        setEndingDate(event.target.value);
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handleTransactionTypeChange = (type) => {
        setTransactionType(type);
    };

    const handleMinValueChange = (event) => {
        setMinValue(event.target.value);
    };

    const handleMaxValueChange = (event) => {
        setMaxValue(event.target.value);
    };

    function handleContainsStringChange(event) {
        setContainsString(event.target.value);
    }

    function handleCaseSensitiveChange(event) {
        setCaseSensitive(event.target.value === "true" ? true : false)
    }

    const handleClearFilters = () => {
        setStartingDate(null);
        setEndingDate(null);
        setSelectedCategory(null);
        setMinValue(null);
        setMaxValue(null);
        setContainsString(null);
        setCaseSensitive(null);

        document.getElementById("categorySelect").value = "";
        document.getElementsByName("maxValuePicker")[0].value = "";
        document.getElementsByName("minValuePicker")[0].value = "";
        document.getElementsByName("containsString")[0].value = "";
        document.getElementsByName("caseSensitive")[0].value = "-"
        fetchTransactions();
    };

    const fetchTransactions = async () => {
        try {
            const url = `/api/transaction/transactionsForWallet/${walletId}`;
            const response = await fetch(url, { credentials: "include" });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            console.error("Error during fetching transactions:", error);
        }
    };

    async function handleDelete() {
        const response = await fetch(
            "/api/transaction/deleteTransaction/" + transaction.Id,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );
        if (response.ok) {
            document.getElementById("closeModalBtn").click();
            handleFilterClick();
        }
    }

    const handleAddTransaction = async (newTransactionData) => {
        try {
            let url = "";
            if (newTransactionData.type === "income") {
                url = "/api/transaction/addIncome";
            } else {
                url = "/api/transaction/addExpenditure";
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newTransactionData),
                credentials: "include",
            });

            if (response.ok) {
                setAddedTransaction(newTransactionData);
            } else {
                showFailedAlert("Failed adding transaction! Try again");
                console.error(response);
            }
        } catch (error) {
            console.error("Error adding transaction:", error);
        }
    };

    const findCategoryName = (categoryId) => {
        const foundCategory = categories.find(
            (category) => category.Id === categoryId
        );
        return foundCategory ? foundCategory.Name : "Unknown";
    };

    const getCardBackgroundColor = (transactionType) => {
        if (transactionType === 'income') {
            return 'bg-income';
        } else if (transactionType === 'expenditure') {
            return 'bg-expenditure';
        } else {
            return '';
        }
    };

    async function handleModalSubmit() {
        const newTransactionData = {
            id: transaction.Id,
            title: transaction.Title,
            description: transaction.Description,
            date: transaction.Date,
            amount: transaction.Amount,
            walletId: walletId,
            categoryId: transaction.CategoryId,
            type: transaction.TransactionType,
        };
        let response;
        switch (newTransactionData.type) {
            case "income":
                response = await fetch("/api/transaction/updateIncome", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newTransactionData),
                    credentials: "include",
                });
                if (response.ok) {
                    document.getElementById("closeModalBtn").click();
                    handleFilterClick();
                }
                break;
            case "expenditure":
                response = await fetch("/api/transaction/updateExpenditure", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newTransactionData),
                    credentials: "include",
                });
                if (response.ok) {
                    document.getElementById("closeModalBtn").click();
                    handleFilterClick();
                }
                break;
            default:
                break;
        }
    }

    const handleFilterClick = async () => {
        const startDate = startingDate ? new Date(startingDate) : null;
        const endDate = endingDate ? new Date(endingDate) : null;

        let formattedStartingDate = "";
        let formattedEndingDate = "";

        if (startDate) {
            formattedStartingDate = startDate.toISOString().split("T")[0];
        }

        if (endDate) {
            formattedEndingDate = endDate.toISOString().split("T")[0];
        }

        try {
            let url = `/api/transaction/`;
            if (transactionType === "income") {
                url += `incomesForWallet/${walletId}`;
            } else if (transactionType === "expenditure") {
                url += `expendituresForWallet/${walletId}`;
            } else {
                url += `transactionsForWallet/${walletId}`;
            }
            const queryParams = [
                startDate ? `startDate=${formattedStartingDate}` : null,
                endDate ? `endDate=${formattedEndingDate}` : null,
                selectedCategory ? `selectedCategory=${selectedCategory}` : null,
                minValue ? `minValue=${minValue}` : null,
                maxValue ? `maxValue=${maxValue}` : null,
                containsString ? `containsString=${containsString}` : null,
                caseSensitive ? `caseSensitive=${caseSensitive}` : null
            ]
                .filter(Boolean)
                .join("&");

            const response = await fetch(`${url}?${queryParams}`, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            console.error("Error during fetching transactions:", error);
        }
    };

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
                    setTimeout(() => {
                        navigate("/");
                    }, 3000);
                }
            } catch (error) {
                console.error("Error checking user login:", error);
            }
        };

        checkUserLogin();
    }, [navigate]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`/api/transaction/allCategories`, {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Error during fetching transactions:", error);
            }
        };

        const fetchName = async () => {
            try {
                const response = await fetch(`/api/transaction/walletName/${walletId}`, {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();
                setWalletName(data);
            } catch (error) {
                console.error("Error during fetching transactions:", error);
            }
        };


        fetchCategories();
        fetchName();
        handleFilterClick();
    }, [walletId]);

    useEffect(() => {
        handleFilterClick();
    }, [walletId, transactionType]);

    useEffect(() => {
        if (addedTransaction) {
            showSuccessAlert("Transaction added successfully!");
            setTimeout(() => {
                setAddedTransaction(null);
            }, 1500);
        }
    }, [addedTransaction]);

    return (
        <div className="container">
            <h2>{translation[props.language].TransactionsPage.List} {walletName}</h2>
            <div className="row my-3">
                <button
                    className="btn btn-primary h-25 w-25 mx-1 col my-1"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? translation[props.language].TransactionsPage.Cancel : translation[props.language].TransactionsPage.AddTrans}
                </button>
            </div>
            {showForm && (
                <TransactionForm
                    props={props}
                    categories={categories}
                    walletId={walletId}
                    onSubmit={(newTransactionData) => {
                        handleAddTransaction(newTransactionData);
                        setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}
            <div className="row my-4">
                <button
                    className="btn btn-secondary h-25 w-25 mx-1 col my-1"
                    onClick={() => handleTransactionTypeChange("all")}
                >
                    {translation[props.language].TransactionsPage.All}
                </button>
                <button
                    className="btn btn-secondary h-25 w-25 mx-1 col my-1"
                    onClick={() => handleTransactionTypeChange("income")}
                >
                    {translation[props.language].TransactionsPage.Incomes}
                </button>
                <button
                    className="btn btn-secondary h-25 w-25 mx-1 col my-1"
                    onClick={() => handleTransactionTypeChange("expenditure")}

                >
                    {translation[props.language].TransactionsPage.Expenditures}
                </button>
            </div>

            <div className="row my-4">
                <button
                    className="btn btn-dark h-25 w-25 mx-1 col-3 my-1"
                    onClick={handleToggleFilters}
                >
                    {showFilters ? translation[props.language].TransactionsPage.Cancel : translation[props.language].TransactionsPage.AddFilters}
                </button>
                <div className="col-3"></div>
                <button
                    className="btn btn-white h-25 w-25 mx-1 col-3 my-1"
                    onClick={handleFilterClick}
                    id="helper"
                >
                </button>
            </div>
            {showFilters && (
                <div>
                    <h3>{translation[props.language].TransactionsPage.Filter}</h3>
                    <div className="row my-3">
                        <div className="col my-2">
                            <div className="d-flex flex-column mx-2 align-items-start">
                                <label className="mb-1">{translation[props.language].TransactionsPage.StDate}</label>
                                <input
                                    type="date"
                                    name="startingDatePicker"
                                    value={startingDate || ""}
                                    onChange={handleStartingDateChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="d-flex flex-column mx-2 align-items-start">
                                <label className="mb-1">{translation[props.language].TransactionsPage.EnDate}</label>
                                <input
                                    type="date"
                                    name="endingDatePicker"
                                    value={endingDate || ""}
                                    onChange={handleEndingDateChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="d-flex flex-column mx-2 align-items-start">
                                <label className="mb-1">{translation[props.language].TransactionsPage.Category}</label>
                                <select
                                    id="categorySelect"
                                    onChange={handleCategoryChange}
                                    className="form-control"
                                >
                                    <option value="">{translation[props.language].TransactionsPage.NoCategory}</option>
                                    {categories.map((category) => (
                                        <option key={category.Id} value={category.Id}>
                                            {category.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="d-flex flex-column mx-2 align-items-start">
                                <label className="mb-1">{translation[props.language].TransactionsPage.MinVal}</label>
                                <input
                                    type="number"
                                    name="minValuePicker"
                                    step="any"
                                    onChange={handleMinValueChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="d-flex flex-column mx-2 align-items-start">
                                <label className="mb-1">{translation[props.language].TransactionsPage.MaxVal}</label>
                                <input
                                    type="number"
                                    name="maxValuePicker"
                                    step="any"
                                    onChange={handleMaxValueChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="d-flex flex-column mx-2 align-items-start">
                                <label className="mb-1">{translation[props.language].TransactionsPage.Contains}</label>
                                <input
                                    type="text"
                                    name="containsString"
                                    onChange={handleContainsStringChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="d-flex flex-column mx-2 align-items-start">
                                <label className="mb-1">{translation[props.language].TransactionsPage.CaseSensitive}</label>
                                <select
                                    name="caseSensitive"
                                    onChange={handleCaseSensitiveChange}
                                    className="form-control"
                                >
                                    <option value={null}>-</option>
                                    <option value={false}>{translation[props.language].TransactionsPage.No}</option>
                                    <option value={true}>{translation[props.language].TransactionsPage.Yes}</option>
                                </select>
                            </div>
                            <button
                                className="btn btn-secondary mx-2 my-2 align-self-end"
                                onClick={() => {
                                    handleFilterClick();
                                    setShowChart(false);
                                }}
                                id="FilterButton"
                            >
                                {translation[props.language].TransactionsPage.Filter}
                            </button>
                            <button
                                className="btn btn-secondary mx-2 my-2 align-self-end"
                                onClick={() => {
                                    handleClearFilters();
                                    setShowChart(true);
                                }}
                                id="ClearFiltersButton"
                            >
                                {translation[props.language].TransactionsPage.Clear}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="row my-3">
                <div className="col-md-6">
                {transactions.length > 0 && showChart && (transactionType === "expenditure" || transactionType === "all") && (
                        <>
                            <div className="card mx-auto my-5 h-auto background-chart w-75" style={{ border: 'none' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '22px', marginBottom: '0px' }}>{translation[props.language].TransactionsPage.ExpByCategory}</p>
                            
                                <ExpensesChart transactions={transactions} categories={categories} findCategoryName={findCategoryName} />
                            </div>
                    </>
                    )}
                </div>
                <div className="col-md-6">
                {transactions.length > 0 && showChart && transactionType === "all" && (
                        <>
                            <div className="card mx-auto my-5 h-auto background-chart w-75" style={{ border: 'none' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '22px' }}>{translation[props.language].TransactionsPage.Report}</p> </div>
                        <TransactionsChart transactions={transactions} totalIncomes={totalIncomes} totalExpenditures={totalExpenditures} />
                                <h3 style={{ fontSize: '26px', textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}> {translation[props.language].TransactionsPage.Remaining} <span style={{ color: 'lightgreen', fontSize: '26px' }}>{remainingAmount}</span></h3>
                           
                    </>
                    )}
                </div>
                {transactions.map((transaction, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            setTransaction(transaction);
                        }}
                        data-bs-toggle="modal"
                        data-bs-target="#modalId"
                        className="col my-3"
                        style={{ minWidth: "30%" }}
                    >
                        <div className={`card h-100 w-100 text-center ${getCardBackgroundColor(transaction.TransactionType)}`}>
                            <h2 className="w-75">{transaction.Title}</h2>
                            <h5>{transaction.Amount} PLN</h5>
                            <p>{findCategoryName(transaction.CategoryId)}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div
                className="modal fade"
                id="modalId"
                tabIndex="-1"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                role="dialog"
                aria-labelledby="modalTitleId"
                aria-hidden="true"
            >
                <div
                    className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-sm"
                    role="document"
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="modalTitleId">
                                {translation[props.language].TransactionsPage.Transaction}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {transaction !== null ? (
                                <div>
                                    <div className="mb-3">
                                        <label htmlFor="modal-tname" className="form-label">
                                            {translation[props.language].TransactionsPage.Title}
                                        </label>
                                        <input
                                            id="modal-tname"
                                            type="text"
                                            name="Title"
                                            className="form-control"
                                            aria-describedby="helpId"
                                            value={transaction.Title}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="modal-tamount" className="form-label">
                                            {translation[props.language].TransactionsPage.Amount}
                                        </label>
                                        <input
                                            id="modal-tamount"
                                            type="number"
                                            name="Amount"
                                            className="form-control"
                                            aria-describedby="helpId"
                                            value={transaction.Amount}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="modal-tdesc" className="form-label">
                                            {translation[props.language].TransactionsPage.Desc}
                                        </label>
                                        <input
                                            id="modal-tdesc"
                                            type="text"
                                            name="Description"
                                            className="form-control"
                                            aria-describedby="helpId"
                                            value={transaction.Description}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="modal-tdesc" className="form-label">
                                            {translation[props.language].TransactionsPage.Date}
                                        </label>
                                        <br />
                                        <input
                                            type="date"
                                            name="Date"
                                            value={transaction.Date.split("T")[0]}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="modal-tcategory" className="form-label">
                                            {translation[props.language].TransactionsPage.Category}
                                        </label>
                                        <select
                                            value={transaction.CategoryId}
                                            name="CategoryId"
                                            onChange={handleInputChange}
                                        >
                                            {categories.map((category, i) =>
                                                category.Type.toLowerCase() ===
                                                    transaction.TransactionType.toLowerCase() ? (
                                                    <option key={i} value={category.Id}>
                                                        {" "}
                                                        {category.Name}
                                                    </option>
                                                ) : null
                                            )}
                                        </select>
                                    </div>
                                    <h5>
                                        {translation[props.language].TransactionsPage.Type}
                                        <br />
                                        {transaction.TransactionType}
                                    </h5>
                                </div>
                            ) : (
                                "BRAK"
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                id="closeModalBtn"
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                {translation[props.language].TransactionsPage.Close}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete()}
                                className="btn btn-danger"
                            >
                                {translation[props.language].TransactionsPage.Delete}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModalSubmit()}
                                className="btn btn-primary"
                            >
                                {translation[props.language].TransactionsPage.Save}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {!isLoggedIn && alertMessage !== "" && (
                <div className="alert alert-danger" role="alert">
                    {alertMessage}
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default TransactionList; 