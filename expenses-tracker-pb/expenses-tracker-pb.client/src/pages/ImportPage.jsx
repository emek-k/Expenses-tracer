import React, { useState } from "react";
import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import translation from "../assets/translation.json";

function Import(props) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [wallets, setWallets] = useState(null);
  const [selectedWalletsID, setselectedWalletsID] = useState([]);
  const [clearAll, setClearAll] = useState(false);
  const [alertDanger, setAlertDanger] = useState(null);
  const [alertSuccess, setAlertSuccess] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const isUserLogged = async () => {
        try {
            const response = await fetch("/api/import/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (response.status === 401) {
                setAlertDanger("You are not logged in. Redirecting to login page...");
                console.error(
                    "The user is not logged in!",
                    response.status,
                    response.statusText
                );
                setTimeout(() => {
                    navigate("/"); 
                }, 3000);
        }
        if (response.ok) {
          setAlertDanger(null);
          setAlertSuccess(null);
        }
      } catch (error) {
        console.error("Error importing wallets:", error.message);
      }
    };
    isUserLogged();
  }, []);

  const handleFile = (event) => {
    const file = event.target.files[0];
    setAlertSuccess(null);
    setAlertDanger(null);
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const fileContent = e.target.result;

        try {
          const parsedData = JSON.parse(fileContent);
          createWalletArray(parsedData);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };

      reader.readAsText(file);
      setSelectedFile(file);
    }
  };

  function createWalletArray(parsedData) {
    var counterId = 0;
    var walletsArray = parsedData.map((walletData) => {
      counterId++;
      return {
        Id: counterId,
        Name: walletData.Name,
        IconId: walletData.IconId,
        AccountBalance: walletData.AccountBalance,
        UserId: walletData.UserId,
        Expenditures: walletData.Expenditures,
        Incomes: walletData.Incomes,
        IncomesCount: walletData.Incomes.length,
        ExpendituresCount: walletData.Expenditures.length,
      };
    });
    setWallets(walletsArray);
  }

  const handleRowClick = (id) => {
    setselectedWalletsID((prevselectedWalletsID) => {
      if (prevselectedWalletsID.includes(id)) {
        return prevselectedWalletsID.filter((selectedId) => selectedId !== id);
      } else {
        return [...prevselectedWalletsID, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedWalletsID.length > 0) {
      setselectedWalletsID([]);
      setClearAll(false);
    } else {
      const allWalletIds = wallets.map((wallet) => wallet.Id);
      setselectedWalletsID(allWalletIds);
      setClearAll(true);
    }
  };

  useEffect(() => {
    if (selectedWalletsID.length === 0 && clearAll) {
      setClearAll(false);
    } else if (selectedWalletsID.length > 0 && !clearAll) {
      setClearAll(true);
    }
  }, [selectedWalletsID, clearAll]);

  function handleImport() {
    if (selectedWalletsID.length === 0) {
        setAlertDanger(translation[props.language].Import.AlertDanger);
      return;
    }

    setAlertDanger(null);
    sendselectedWalletsID();
  }

  const sendselectedWalletsID = async () => {
    const selectedWalletToImport = wallets.filter((wallet) =>
      selectedWalletsID.includes(wallet.Id)
    );

    try {
      const response = await fetch("/api/import/importWallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(selectedWalletToImport),
      });

      if (response.ok) {
        const responseData = await response.text();
        setAlertSuccess(responseData);
      }

      if (response === 401) {
        setAlertDanger("The user is not logged in!");
        setAlertSuccess(null);
      }
    } catch (error) {
      console.error("Error importing wallets:", error.message);
    }
  };

  return (
    <>
      <div className="container">
        <h2 className="mt-4">Import</h2>
        <div className="mb-3">
          <input
            className="form-control"
            type="file"
            id="formFile"
            onChange={handleFile}
          ></input>
        </div>

        {wallets && (
          <>
            {clearAll ? (
              <button className="btn btn-secondary" onClick={handleSelectAll}>
                {" "}
                              {translation[props.language].Import.ClearAll}
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={handleSelectAll}>
                                  {translation[props.language].Import.SelectAll}
              </button>
            )}

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col"></th>
                    {/* <th scope="col">Icon</th> */}
                                      <th scope="col">{translation[props.language].Import.Name}</th>
                                      <th scope="col">{translation[props.language].Import.AccBal}</th>
                                      <th scope="col">{translation[props.language].Import.Incomes}</th>
                                      <th scope="col">{translation[props.language].Import.Expenditures}</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((wallet, index) => (
                    <tr
                      key={index}
                      className={
                        selectedWalletsID.includes(wallet.Id)
                          ? "table-primary"
                          : undefined
                      }
                      onClick={() => handleRowClick(wallet.Id)}
                    >
                      <th><input
                        type="checkbox"
                        className="form-check-input"
                        onChange={() => handleRowClick(wallet.Id)}
                        onClick={() => handleRowClick(wallet.Id)}
                        checked={selectedWalletsID.includes(wallet.Id)}
                      /></th>
                      {/* <td>{wallet.IconId}</td> */}
                      <td>{wallet.Name}</td>
                      <td>{wallet.AccountBalance}</td>
                      <td>{wallet.IncomesCount}</td>
                      <td>{wallet.ExpendituresCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-primary" onClick={handleImport}>
                          {translation[props.language].Import.ImportSelected}
            </button>
          </>
        )}
        {alertDanger != null ? (
          <div className="alert alert-danger" role="alert">
            {alertDanger}
          </div>
        ) : undefined}
        {alertSuccess != null ? (
          <div className="alert alert-success" role="alert">
            {alertSuccess}
          </div>
        ) : undefined}
      </div>
    </>
  );
}
export default Import;
