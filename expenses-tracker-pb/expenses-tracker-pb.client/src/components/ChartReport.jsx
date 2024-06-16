import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ChartReport = ({ summary }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (summary) {
            const ctx = chartRef.current.getContext("2d");
            const xValues = ["Incomes", "Expenses"];
            const yValues = [summary.totalIncome, summary.totalExpenditure];

            if (chartRef.current && chartRef.current.chart) {
                chartRef.current.chart.destroy(); 
            }

            chartRef.current.chart = new Chart(ctx, {
                type: "pie",
                data: {
                    labels: xValues,
                    datasets: [{
                        fill: false,
                        lineTension: 0,
                        backgroundColor: ["lightgreen", "lightcoral"],
                        borderColor: "6C698D",
                        data: yValues,
                    }]
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
                },
            });
        }
    }, [summary]);

    return (
        <div className="card mx-auto my-5 h-auto background-my w-75">
            <p style={{ fontWeight: 'bold', fontSize: '18px' }}>Financial Summary</p>
            <div style={{ height: '300px' }}>
                <canvas ref={chartRef} width="400" height="400"></canvas>
            </div>
        </div>
    );
};

export default ChartReport;
