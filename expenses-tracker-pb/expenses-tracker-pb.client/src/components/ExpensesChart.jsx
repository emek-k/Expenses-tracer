import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const ExpensesChart = ({ transactions, categories, findCategoryName }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartInstance.current !== null) {
            chartInstance.current.destroy();
        }

        const expenditures = transactions.filter(transaction => transaction.TransactionType === "expenditure");
        const groupedTransactions = groupTransactionsByCategory(expenditures);
        const labels = Object.keys(groupedTransactions);
        const data = Object.values(groupedTransactions);

        const ctx = chartRef.current.getContext("2d");

        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Amount',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(255, 0, 0, 0.2)',
                        'rgba(0, 255, 0, 0.2)',
                        'rgba(0, 0, 255, 0.2)',
                        'rgba(255, 255, 0, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 0, 0, 1)',
                        'rgba(0, 255, 0, 1)',
                        'rgba(0, 0, 255, 1)',
                        'rgba(255, 255, 0, 1)',
                    ],
                    borderWidth: 1,
                }]
            },
            options: {
                scales: {
                    y: {
                        display: false, // Ukrycie osi liniowej Y
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current !== null) {
                chartInstance.current.destroy();
            }
        };
    }, [transactions, categories]);

    const groupTransactionsByCategory = (expenditures) => {
        const groupedTransactions = {};

        expenditures.forEach(transaction => {
            const category = findCategoryName(transaction.CategoryId);
            if (!groupedTransactions[category]) {
                groupedTransactions[category] = 0;
            }
            groupedTransactions[category] += transaction.Amount;
        });

        return groupedTransactions;
    };

    return (
        <div className="card mx-auto my-5 h-auto background-chart w-75" style={{ border: 'none' }}>
            <div style={{ height: '300px' }}>
                <canvas ref={chartRef} width="400" height="400"></canvas>
            </div>
        </div>
    );
};

export default ExpensesChart;
