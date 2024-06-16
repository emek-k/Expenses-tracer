import React, { useState } from 'react';

const Comparison = ({ handleGenerateReportClick }) => {
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');

    const years = [];
    const currentYear = new Date().getFullYear();
    const startYear = 2018;
    for (let year = currentYear; year >= startYear; year--) {
        years.push(year.toString());
    }

    const quarters = ['I', 'II', 'III', 'IV'];
    const halfYear = 'Half Year';
    const fullYear = 'Full Year';

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const handlePeriodChange = (event) => {
        setSelectedPeriod(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        handleGenerateReportClick(selectedYear, selectedPeriod);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Select Year:
                <select value={selectedYear} onChange={handleYearChange}>
                    <option value="">-- Select Year --</option>
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Select Period:
                <select value={selectedPeriod} onChange={handlePeriodChange}>
                    <option value="">-- Select Period --</option>
                    {quarters.map((quarter) => (
                        <option key={quarter} value={`Q${quarter}`}>
                            {`Q${quarter}`}
                        </option>
                    ))}
                    <option value={halfYear}>Half Year</option>
                    <option value={fullYear}>Full Year</option>
                </select>
            </label>
            <button type="submit">Compare</button>
        </form>
    );
};

export default Comparison;
