import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccessAlert, showFailedAlert, showWarningAlert } from "../components/ToastifyAlert";
import translation from "../assets/translation.json";


const ManageCategories = (props) => {
    const [categories, setCategories] = useState([]);
    const [information, setInformation] = useState('');
    const [newCategory, setNewCategory] = useState({
        name: '',
        type: 'Expenditure',
    });
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategory, setEditingCategory] = useState({
        name: '',
        type: 'Expenditure',
    });
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkUserLogin();
        fetchCategories();
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

    const handleInputChange = (e, isEditing = false) => {
        const { name, value } = e.target;

        if (isEditing) {
            setEditingCategory({ ...editingCategory, [name]: value });
        } else {
            setNewCategory({ ...newCategory, [name]: value });
        }
    };

    const handleAddCategory = async () => {
        if (newCategory.name === '') {
            showWarningAlert(translation[props.language].TransactionsPage.NameError);
        }
        else {
            const foundCategory = categories.find(
                (category) => category.Name === newCategory.name
            );

            if (foundCategory === null || foundCategory === undefined) {
                try {
                    const response = await fetch('/api/transaction/addCategory', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newCategory),
                    });

                    if (!response.ok) {
                        showFailedAlert(translation[props.language].TransactionsPage.Failed);
                        throw new Error('Failed to add category');
                    }

                    showSuccessAlert(translation[props.language].TransactionsPage.Success);
                } catch (error) {
                    console.error('Error during adding category:', error);
                    showFailedAlert(translation[props.language].TransactionsPage.Failed);
                }
            }
            else {
                showWarningAlert(translation[props.language].TransactionsPage.CategoryExists);
            }
        }
        fetchCategories();
        setNewCategory({ name: '', type: 'Expenditure' });
    };

    const handleEditCategory = async () => {
        if (editingCategory.name === '') {
            showWarningAlert('You have to name your category!');
        }
        else {
            const foundCategory = categories.find(
                (category) => category.Name === editingCategory.name && category.Id !== editingCategoryId
            );

            if (foundCategory === null || foundCategory === undefined) {
                try {
                    const response = await fetch(`/api/transaction/editCategory/${editingCategoryId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(editingCategory),
                    });

                    if (!response.ok) {
                        showFailedAlert('Error during saving changes.');
                        throw new Error('Failed to edit category');
                    }
                    showSuccessAlert('Changes saved.');
                } catch (error) {
                    console.error('Error during editing category:', error);
                    showFailedAlert('Error during saving changes.');
                }
            }
            else {
                showWarningAlert('Category with that name already exists!');
            }
        }
        fetchCategories();
        setEditingCategoryId(null);
        setEditingCategory({ name: '', type: 'Expenditure' });
    };

    const handleDeleteCategory = async (categoryId) => {

        const hasTransactions = await checkTransactionsForCategory(categoryId);

        if (hasTransactions) {
            showFailedAlert('There are transactions associated with this category. Cannot delete.');
        }
        else {
            try {
                const response = await fetch(`/api/transaction/deleteCategory/${categoryId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });

                if (!response.ok) {
                    showFailedAlert('Failed to delete category.');
                    throw new Error('Failed to delete category');
                }

                showSuccessAlert('Category deleted.');
                fetchCategories();
            } catch (error) {
                console.error('Error during deleting category:', error);
                showFailedAlert('Failed to delete category.');
            }
        }
    };

    const handleStartEditingCategory = (category) => {
        setEditingCategoryId(category.Id);
        setEditingCategory({
            name: category.Name,
            type: category.Type,
        });
    };

    const handleCancelEditingCategory = () => {
        setEditingCategoryId(null);
        setEditingCategory({ name: '', type: 'Expenditure' });
    };

    const checkTransactionsForCategory = async (categoryId) => {
        try {
            const response = await fetch(`/api/transaction/checkTransactions/${categoryId}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to check transactions');
            }

            const data = await response.json();
            return data.hasTransactions;
        } catch (error) {
            console.error('Error checking transactions:', error);
            return false;
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/transaction/allCategories', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error during fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="mb-4"> {translation[props.language].Categories.Categories}</h2>
            <div className="mb-4">
                <h4>{translation[props.language].TransactionsPage.CreateCategory}</h4>
                <div className="mb-3">
                    <label className="form-label">
                        {translation[props.language].Categories.Name}
                        <input
                            type="text"
                            name="name"
                            value={newCategory.name}
                            onChange={(e) => handleInputChange(e)}
                            className="form-control"
                        />
                    </label>
                </div>
                <div className="mb-3">
                    <label className="form-label">
                        {translation[props.language].Categories.Type}
                        <select
                            name="type"
                            value={newCategory.type}
                            onChange={(e) => handleInputChange(e)}
                            className="form-select"
                        >
                            <option value="Expenditure">{translation[props.language].TransactionsPage.Expenditure}</option>
                            <option value="Income">{translation[props.language].TransactionsPage.Income}</option>
                        </select>
                    </label>
                </div>
                <button onClick={handleAddCategory} className="btn btn-primary">{translation[props.language].Categories.AddCat}</button>
                {information && <div className="error">{information}</div>}
            </div>

            <div className="mb-4">
                <h3>{translation[props.language].Categories.ExistCat}</h3>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <h3>{translation[props.language].TransactionsPage.Expenditures}</h3>
                    <ul className="list-group">
                        {categories
                            .filter((category) => category.Type === "Expenditure")
                            .map((category) => (
                                <li key={category.Id} className="list-group-item d-flex justify-content-between align-items-center">
                                    {editingCategoryId === category.Id ? (
                                        <>
                                            <div className="d-flex flex-column">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editingCategory.name}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    className="form-control mb-2"
                                                />
                                                <select
                                                    name="type"
                                                    value={editingCategory.type}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    className="form-select mb-2"
                                                >
                                                    <option value="Expenditure">{translation[props.language].TransactionsPage.Expenditure}</option>
                                                    <option value="Income">{translation[props.language].TransactionsPage.Income}</option>
                                                </select>
                                            </div>
                                            <div className="d-flex">
                                                <button onClick={handleEditCategory} className="btn btn-success me-2">{translation[props.language].TransactionsPage.Save}</button>
                                                <button onClick={handleCancelEditingCategory} className="btn btn-secondary">{translation[props.language].TransactionsPage.Cancel}</button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-grow-1">{category.Name}</div>
                                            {!category.IsDefault && (
                                                <div className="btn-group">
                                                        <button onClick={() => handleStartEditingCategory(category)} className="btn btn-warning me-2">{translation[props.language].Categories.Edit}</button>
                                                        <button onClick={() => handleDeleteCategory(category.Id)} className="btn btn-danger">{translation[props.language].TransactionsPage.Delete}</button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}
                    </ul>
                </div>

                <div className="col-md-6">
                    <h3>{translation[props.language].TransactionsPage.Incomes}</h3>
                    <ul className="list-group">
                        {categories
                            .filter((category) => category.Type === "Income")
                            .map((category) => (
                                <li key={category.Id} className="list-group-item d-flex justify-content-between align-items-center">
                                    {editingCategoryId === category.Id ? (
                                        <>
                                            <div className="d-flex flex-column">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editingCategory.name}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    className="form-control mb-2"
                                                />
                                                <select
                                                    name="type"
                                                    value={editingCategory.type}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    className="form-select mb-2"
                                                >
                                                    <option value="Expenditure">{translation[props.language].TransactionsPage.Expenditure}</option>
                                                    <option value="Income">{translation[props.language].TransactionsPage.Income}</option>
                                                </select>
                                            </div>
                                            <div className="d-flex">
                                                <button onClick={handleEditCategory} className="btn btn-success me-2">{translation[props.language].TransactionsPage.Save}</button>
                                                <button onClick={handleCancelEditingCategory} className="btn btn-secondary">{translation[props.language].TransactionsPage.Cancel}l</button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-grow-1">{category.Name}</div>
                                            {!category.IsDefault && (
                                                <div className="btn-group">
                                                        <button onClick={() => handleStartEditingCategory(category)} className="btn btn-warning me-2">{translation[props.language].Categories.Edit}</button>
                                                        <button onClick={() => handleDeleteCategory(category.Id)} className="btn btn-danger">{translation[props.language].TransactionsPage.Delete}</button>
                                                    </div>
                                                )}
                                        </>
                                    )}
                                </li>
                            ))}
                    </ul>
                </div>
                <div className="mb-4"></div>
                {!isLoggedIn && (
                    <div className="alert alert-danger" role="alert" style={{ marginTop: '20px', textAlign: 'center' }}>
                        {translation[props.language].Categories.NotLoggedIn}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageCategories;
