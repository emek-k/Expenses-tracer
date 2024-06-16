import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChartReport from '../components/ChartReport';
import Comparison from '../components/ChartComparison';
import '../styles/FinancialReport.css';
import translation from "../assets/translation.json";

const MonthlySummary = (props) => {
    const [wallets, setWallets] = useState([]);
    const [walletId, setWalletId] = useState('');
    const [walletName, setWalletName] = useState('');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const [month, setMonth] = useState(currentMonth.toString());
    const currentYear = currentDate.getFullYear();
    const [year, setYear] = useState(currentYear.toString());
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [dataGenerated, setDataGenerated] = useState(false);
    const [months] = useState([
        translation[props.language].Report.January,
        translation[props.language].Report.February,
        translation[props.language].Report.March,
        translation[props.language].Report.April,
        translation[props.language].Report.May,
        translation[props.language].Report.June,
        translation[props.language].Report.July,
        translation[props.language].Report.August,
        translation[props.language].Report.September,
        translation[props.language].Report.October,
        translation[props.language].Report.November,
        translation[props.language].Report.December
    ]);
    const years = [];
    const startYear = 2018;
    for (let year = currentYear; startYear <= year; year--) {
        years.push(year.toString());
    }
    const [activeTab, setActiveTab] = useState('summary');
    const [quarterOrHalfYear, setQuarterOrHalfYear] = useState('All');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkUserLogin();
        fetchWallets();
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            const redirectTimer = setTimeout(() => {
                navigate("/");
            }, 3000);

            return () => clearTimeout(redirectTimer);
        }
    }, [isLoggedIn, navigate]);

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
            }
        } catch (error) {
            console.error("Error checking user login:", error);
        }
    };

    const fetchWallets = async () => {
        try {
            const response = await fetch('/api/account/getWallets', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const walletData = await response.json();
                setWallets(walletData);
                if (walletData.length > 0) {
                    setWalletId(walletData[0].id);
                }
            } else {
                console.error(response);
            }
        } catch (error) {
            console.error('Error fetching wallets:', error);
        }
    };

    const handleGenerateClick = async () => {
        try {
            let apiEndpoint = '';
            if (month === 'All') {
                apiEndpoint = `/api/transaction/yearlySummary/${walletId}/${year}`;
            } else {
                apiEndpoint = `/api/transaction/monthlySummary/${walletId}/${year}/${month}`;
            }

            const response = await fetch(apiEndpoint, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setSummary(data);
            setTransactions(data.transactions);
            setDataGenerated(true);
            const selectedWallet = wallets.find((wallet) => wallet.id === walletId);
            const walletName = selectedWallet ? selectedWallet.name : '';
        } catch (error) {
            console.error('Error during fetching summary:', error);
        }
    };

    const handleGenerateReportClick = async () => {
        try {
            const response = await fetch(`/api/transaction/generateMonthlyReportPDF/${walletId}/${year}/${month}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            const wallet = wallets.find((wallet) => wallet.id === walletId);
            const walletName = wallet ? wallet.name.replace(/ /g, '_') : 'wallet';

            const fileName = `monthly_report_${walletName}_${month}_${year}.pdf`;

            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();

            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error during fetching PDF:', error);
        }
    };

    const handleGenerateExcelClick = async () => {
        try {
            const response = await fetch(`/api/transaction/generateMonthlyReportExcel/${walletId}/${year}/${month}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            const wallet = wallets.find((wallet) => wallet.id === walletId);
            const walletName = wallet ? wallet.name.replace(/ /g, '_') : 'wallet';

            const fileName = `monthly_report_${walletName}_${month}_${year}.xlsx`;

            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();

            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error during fetching Excel:', error);
        }
    };


    return (
        <div className='container'>
            <div className="select-container">
                <select
                    className="form-select"
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    style={{ marginRight: '10px' }}
                >
                    {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                            {wallet.name}
                        </option>
                    ))}
                </select>
                <select
                    className="form-select"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    style={{ marginRight: '10px' }}
                >
                    {years.map((yearOption) => (
                        <option key={yearOption} value={yearOption}>
                            {yearOption}
                        </option>
                    ))}
                </select>
                <select
                    className="form-select"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                >
                    <option value="All">{translation[props.language].Report.All}</option>
                    {months.map((month, index) => (
                        <option key={index} value={index + 1}>
                            {month}
                        </option>
                    ))}
                </select>
            </div>
            <div style={{ overflow: "hidden" }}>
                <button className={activeTab === 'summary' ? 'active-tab' : 'inactive-tab'} style={{ width: "100%" }} onClick={() => setActiveTab('summary')}>{translation[props.language].Report.MonthlySum}</button>
                <div className="tab-divider" />
                <button className={activeTab === 'comparison' ? 'active-tab' : 'inactive-tab'} style={{ width: "100%" }} onClick={() => setActiveTab('comparison')}>{translation[props.language].Report.MonthlyCom}</button>

            </div>
            {activeTab === 'summary' && (
                <div>
                    <h1 className="divider"></h1>

                    <div className="btn-container">
                        {month === 'All' ? (
                            <button className="btn btn-primary" onClick={handleGenerateClick}>
                                {translation[props.language].Report.Generate}
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-primary" style={{ marginRight: '10px' }} onClick={handleGenerateClick}>
                                        {translation[props.language].Report.Generate}
                                </button>
                                <button className="btn btn-secondary" style={{ marginRight: '10px' }} onClick={handleGenerateReportClick}>
                                        {translation[props.language].Report.GeneratePDF}
                                </button>
                                <button className="btn btn-tertiary" onClick={handleGenerateExcelClick}>
                                        {translation[props.language].Report.GenerateExcel}
                                </button>
                            </>
                        )}
                    </div>

                    {summary && dataGenerated && (
                        <div className="summary-section">
                            <div>
                                <div>
                                    <h3>{translation[props.language].Report.TotalInc} <span style={{ color: 'lightgreen' }}>{summary.totalIncome}</span></h3>
                                    <h3>{translation[props.language].Report.TotalExp} <span style={{ color: 'lightcoral' }}>{summary.totalExpenditure}</span></h3>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h3>{translation[props.language].Report.NetBalance} {summary.netBalance}</h3>
                                </div>
                            </div>
                            <ChartReport summary={summary} />
                        </div>
                    )}

                    {summary && ((summary.incomeByCategory && summary.incomeByCategory.length > 0) || (summary.expenditureByCategory && summary.expenditureByCategory.length > 0)) && (
                        <div className="data-container1">
                            <div className="color-data-section">
                                {summary.incomeByCategory && summary.incomeByCategory.length > 0 && (
                                    <div>
                                        <div>
                                            <h3>{translation[props.language].Report.CatInc}</h3>
                                            {summary.incomeByCategory.map((category, index) => (
                                                <div key={index}>
                                                    <p>
                                                        <strong>{category.categoryName}</strong> - {category.totalAmount} PLN
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {summary.expenditureByCategory && summary.expenditureByCategory.length > 0 && (
                                    <div>
                                        <div>
                                            <h3>{translation[props.language].Report.CatExp}</h3>
                                            {summary.expenditureByCategory.map((category, index) => (
                                                <div key={index}>
                                                    <p>
                                                        <strong>{category.categoryName}</strong> - {category.totalAmount} PLN
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="transaction-list" style={{ display: transactions.length > 0 ? 'block' : 'none' }}>
                        {transactions.length > 0 && (
                            <div>
                                <h3>{translation[props.language].Report.Transactions}</h3>
                                {transactions.map((transaction, index) => (
                                    <div key={index}>
                                        <p>
                                            {new Date(transaction.date).toLocaleDateString('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' })} - {transaction.title} - {transaction.description} - {transaction.amount} PLN &nbsp;
                                            <span style={{ color: transaction.type === 'income' ? 'green' : 'red' }}>
                                                ({transaction.type === 'income' ? translation[props.language].Report.Income : translation[props.language].Report.Expenditure})
                                            </span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'comparison' && (
                <div>
                    <h1 className="divider"></h1>

                    <Comparison walletId={walletId} year={year} month={month} />
                </div>
            )}
            {!isLoggedIn && (
                <div className="alert alert-danger" role="alert">
                    You are not logged in. Redirecting to login page...
                </div>
            )}
        </div>

    );
};

export default MonthlySummary;
