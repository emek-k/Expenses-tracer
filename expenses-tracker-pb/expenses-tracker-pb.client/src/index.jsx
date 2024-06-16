import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ToastContainer } from 'react-toastify';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
    <>
        <App />
        <ToastContainer />
    </>
);