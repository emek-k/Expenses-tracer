import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const Comparison = ({ walletId, year, month }) => {
    const chartRef = useRef(null);
    const [comparisonData, setComparisonData] = useState([]);
    const [chartInstance, setChartInstance] = useState(null);

    useEffect(() => {
        const fetchComparisonData = async () => {
            try {
                const response = await fetch(`/api/transaction/monthlyComparison/${walletId}/${year}/${month}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setComparisonData(data);
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                console.error('Error fetching comparison data:', error);
            }
        };

        fetchComparisonData();
    }, [walletId, year, month]);

    useEffect(() => {
        if (comparisonData.length > 0) {
            if (chartInstance) {
                chartInstance.destroy();
            }

            const ctx = chartRef.current.getContext('2d');

            const months = comparisonData.map(item => `${item.month}-${item.year}`);
            const incomes = comparisonData.map(item => item.income);
            const expenditures = comparisonData.map(item => item.expenditure);

            const newChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: 'Incomes',
                            backgroundColor: 'lightgreen',
                            borderColor: 'green',
                            borderWidth: 1,
                            data: incomes,
                            barPercentage: 0.9,
                            categoryPercentage: 0.9,
                        },
                        {
                            label: 'Expenditures',
                            backgroundColor: 'lightcoral',
                            borderColor: 'red',
                            borderWidth: 1,
                            data: expenditures,
                            barPercentage: 0.9,
                            categoryPercentage: 0.9,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            suggestedMin: 0,
                            suggestedMax: Math.max(...expenditures, ...incomes) + 100,
                        },
                    },
                },
            });

            setChartInstance(newChartInstance);
        }
    }, [comparisonData, year, month]);

    return (
        <div className="card mx-auto my-5 h-auto background-my col-12 col-md-8 col-lg-6" >
            <p style={{ fontWeight: 'bold', fontSize: '18px' }}>Monthly Expenditure Comparison</p>
            <div style={{ height: '300px' }}>
                <canvas ref={chartRef} width="400" height="400"></canvas>
            </div>
        </div>
    );
};

export default Comparison;
