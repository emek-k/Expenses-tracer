import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const TransactionsChart = ({ transactions, totalIncomes, totalExpenditures }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        
        const labels = ['Incomes', 'Expenditures'];
        const data = [totalIncomes, totalExpenditures ];

        if (chartRef.current !== null) {
            chartRef.current.destroy();
        }

        const ctx = document.getElementById('transactionsChart').getContext('2d');

        const newChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)', 
                        'rgba(255, 99, 132, 0.2)' 
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1,
                }]
            },
            options: {
                cutoutPercentage: 50,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                    },
                }
            }
        });

        chartRef.current = newChart;
    }, [transactions, totalIncomes, totalExpenditures]);

    return (

            <div style={{ height: '300px' }}>
                <canvas id="transactionsChart" width="400" height="400"></canvas>
            </div>
       // </div>
    );

};

export default TransactionsChart;
