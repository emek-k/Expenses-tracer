import React, { useState, useEffect } from "react";
import translation from "../assets/translation.json";

const ObligationForm = ({ walletId, onAddObligation, refreshObligationsList, props }) => {
    const [obligationRequest, setObligationRequest] = useState({
        obligation: {
            name: "",
            description: "",
            amount: null,
            startDate: new Date().toISOString().split('T')[0],
            dueDate: new Date().toISOString(),
            wallet: null,
            categoryId: 0,
            categoryRepaymentId: 0,
        },
        walletId: walletId,
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(true); 

    useEffect(() => {
        fetch("/api/obligation/allCategories")
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                return response.json();
            })
            .then((data) => {
                setCategories(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching categories:', error);
                setLoading(false);
            });
    }, []);

    const [formError, setFormError] = useState("");
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [information, setInformation] = useState("");

    const resetForm = () => {
        setObligationRequest({
            obligation: {
                name: "",
                description: "",
                amount: 0,
                startDate: new Date().toISOString(),
                dueDate: new Date().toISOString(),
                wallet: null,
                categoryId: 0,
                categoryRepaymentId: 0,
            },
            walletId: walletId,
        });
        setInformation("");
        setFormError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let valid = true;
        const startDate = new Date(obligationRequest.obligation.startDate);
        const dueDate = new Date(obligationRequest.obligation.dueDate);

        if (obligationRequest.obligation.categoryId == 0) {
            setInformation("You have to choose the obligation category.");
            valid = false;
        } else if (obligationRequest.obligation.name.length < 3) {
            setInformation("The title has to be at least 3 characters long.");
            valid = false;
        } else if (obligationRequest.obligation.amount <= 0) {
            setInformation("Amount has to be greater than 0.");
            valid = false;
        } else if (startDate >= dueDate) {
            setInformation("The Start Date has to be before Due Date.");
            valid = false;
        } else if (obligationRequest.obligation.categoryRepaymentId == 0) {
            setInformation("You have to choose the type of repayment.");
            valid = false;
        } else {
            setInformation("");
        }

        if (valid) {
            console.log(obligationRequest);
            try {
                let url = "/api/obligation/addObligation";

                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(obligationRequest),
                    credentials: "include",
                });

                if (response.ok) {
                    resetForm();
                    setConfirmationVisible(true);
                    setShowForm(false);
                    setTimeout(() => {
                        setConfirmationVisible(false);
                    }, 1500);
                    refreshObligationsList();
                } else {
                    console.error(response);
                    setFormError("Invalid form data");
                }
            } catch (error) {
                console.error("Error adding obligation:", error);
                setFormError("Error adding obligation");
            }
        }
        
    };


    return (
        <div style={{ marginTop: "10px" }}>
            {showForm && (
                <div className="card w-50 h-auto m-auto mb-5 p-3 pt-3" >
                    <form onSubmit={handleSubmit} className="row w-100 g-3">
                        <h5>{translation[props.language].Obligations.AddNew}</h5>
                        <select
                            className="form-control"
                            value={obligationRequest.obligation.categoryId}
                            onChange={(e) =>
                                setObligationRequest({
                                    ...obligationRequest,
                                    obligation: {
                                        ...obligationRequest.obligation,
                                        categoryId: e.target.value,
                                    },
                                })
                            }
                        >
                            <option value="">{translation[props.language].Obligations.SelectCategory}</option>
                            {categories
                                .filter(category => category.type === "Obligation") 
                                .map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                        </select>

                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={obligationRequest.obligation.name}
                            placeholder={translation[props.language].Obligations.EnTitle}
                            onChange={(e) =>
                                setObligationRequest({
                                    ...obligationRequest,
                                    obligation: {
                                        ...obligationRequest.obligation,
                                        name: e.target.value,
                                    },
                                })
                            }
                            required
                        />
                        <input
                            type="text"
                            className="form-control"
                            name="description"
                            value={obligationRequest.obligation.description}
                            placeholder={translation[props.language].Obligations.EnDesc}
                            onChange={(e) =>
                                setObligationRequest({
                                    ...obligationRequest,
                                    obligation: {
                                        ...obligationRequest.obligation,
                                        description: e.target.value,
                                    },
                                })
                            }
                        />
                        <input
                            type="number"
                            className="form-control"
                            name="amount"
                            value={obligationRequest.obligation.amount}
                            placeholder="Enter amount"
                            onChange={(e) =>
                                setObligationRequest({
                                    ...obligationRequest,
                                    obligation: {
                                        ...obligationRequest.obligation,
                                        amount: e.target.value,
                                    },
                                })
                            }
                            required
                        />
                        <input
                            type="date"
                            className="form-control"
                            name="startDate"
                            value={obligationRequest.obligation.startDate}
                            onChange={(e) =>
                                setObligationRequest({
                                    ...obligationRequest,
                                    obligation: {
                                        ...obligationRequest.obligation,
                                        startDate: e.target.value,
                                    },
                                })
                            }
                            required
                        />
                        <input
                            type="date"
                            className="form-control"
                            name="dueDate"
                            value={obligationRequest.obligation.dueDate}
                            onChange={(e) =>
                                setObligationRequest({
                                    ...obligationRequest,
                                    obligation: {
                                        ...obligationRequest.obligation,
                                        dueDate: e.target.value,
                                    },
                                })
                            }
                            required
                        />

                        <select
                            className="form-control"
                            value={obligationRequest.obligation.categoryRepaymentId} 
                            onChange={(e) =>
                                setObligationRequest({
                                    ...obligationRequest,
                                    obligation: {
                                        ...obligationRequest.obligation,
                                        categoryRepaymentId: e.target.value,
                                    },
                                })
                            }
                        >
                            <option value="">{translation[props.language].Obligations.SelectRepay}</option>
                            {categories
                                .filter(category => category.type === "Repayment") 
                                .map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                        </select>

                        {information && <div className="error">{information}</div>}
                        {formError && <div className="col-md-12 error">{formError}</div>}
                        <button type="submit" className="btn btn-primary col-12">
                            {translation[props.language].TransactionsPage.Add}
                        </button>
                    </form>
                </div>
            )}
           {confirmationVisible && (
              <div className="alert alert-success" role="alert">
                    {translation[props.language].Obligations.AddedAlert}
               </div>
            )}
      </div>
    );
};
export default ObligationForm;
