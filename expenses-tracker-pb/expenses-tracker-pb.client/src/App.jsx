import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisterForm from './pages/RegisterFormPage';
import Navbar from './components/Navbar';
import "bootstrap/dist/js/bootstrap.min.js"

import WalletPage from './pages/WalletPage';
import WalletActionsPage from './pages/WalletActionsPage';
import TransactionList from './pages/TransactionsPage';
import ObligationPage from './pages/ObligationsPage';

import Export from './pages/ExportPage';
import Import from './pages/ImportPage';
import FinancialReport from './pages/FinancialReportPage';
import ManageCategories from './pages/ManageCategoriesPage';
import TwoFactorAuthentication from './account/settings/TwoFactorAuthentication';
import ProfilePage from './pages/ProfilePage'
import PasswordRecoveryPage from './pages/PasswordRecoveryPage'
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashbordPage';
import MyReceipt from './pages/MyReceipt';
import BudgetPage from './pages/BudgetPage';

const App = () => {
    const [language, setLanguage] = useState("Polish")
    return (
        <Router>
            <Navbar
                language={language}
                setLanguage={setLanguage}
            />
            <Routes>
                <Route path="/" element={<LandingPage language={language} setLanguage={setLanguage} />} />
                <Route path="/dashboard" element={<DashboardPage language={language} setLanguage={setLanguage} />} />
                <Route path="/register" element={<RegisterForm language={language} setLanguage={setLanguage} />} />

                <Route path="/wallet" element={<WalletPage language={language} setLanguage={setLanguage} />} />
                <Route path="/wallet/actions/:walletId" element={<WalletActionsPage language={language} setLanguage={setLanguage} />} />
                <Route path="/transaction/:walletId" element={<TransactionList language={language} setLanguage={setLanguage} />} />
                <Route path="/obligation/:walletId" element={<ObligationPage language={language} setLanguage={setLanguage} />} />

                <Route path="/export" element={<Export language={language} setLanguage={setLanguage} />} />
                <Route path="/import" element={<Import language={language} setLanguage={setLanguage} />} />
                <Route path="/report" element={<FinancialReport language={language} setLanguage={setLanguage} />} />
                <Route path="/account/settings/twoFactorAuthentication" element={<TwoFactorAuthentication language={language} setLanguage={setLanguage} />} />
                <Route path="/categories" element={<ManageCategories language={language} setLanguage={setLanguage} />} />
                <Route path="/profile" element={<ProfilePage language={language} setLanguage={setLanguage} />}></Route>
                <Route path="/passwordRecovery" element={<PasswordRecoveryPage language={language} setLanguage={setLanguage} />}></Route>
                <Route path="/myReceipt" element={<MyReceipt language={language} setLanguage={setLanguage} />}></Route>
                <Route path="/budget" element={<BudgetPage language={language} setLanguage={setLanguage} />}></Route>
            </Routes>
        </Router>
    );
};

export default App;
