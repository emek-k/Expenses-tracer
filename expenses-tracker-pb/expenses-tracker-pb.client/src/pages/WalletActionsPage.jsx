import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import translation from "../assets/translation.json";

const ObligationsPage = (props) => {
  const navigate = useNavigate();
    const [walletName, setWalletName] = useState(null);
    const { walletId } = useParams();


  const OnClickTransactions = async (walletId) => {
    navigate(`/transaction/${walletId}`);
  };

  const OnClickObligations = async (walletId) => {
    navigate(`/obligation/${walletId}`);
  };

    useEffect(() => {
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
                console.error("Error during fetching wallet name:", error);
            }
        };

        fetchName();
    }, [walletId]);

  return (
    <div className="container">
          <h2 className="d-flex justify-content-center mt-5">{translation[props.language].WalletActions.Wallet} {walletName}</h2>

      <div className="d-flex justify-content-center mt-5">
        <button
          className="btn btn-secondary mx-1 mh-50 w-25"
          onClick={() => OnClickTransactions(walletId)}
        >
                  {translation[props.language].WalletActions.Transactions}
        </button>
        <button
          className="btn btn-secondary mx-1 mh-50 w-25"
          onClick={() => OnClickObligations(walletId)}
        >
                  {translation[props.language].WalletActions.Obligations}
        </button>
      </div>
    </div>
  );
};

export default ObligationsPage;
