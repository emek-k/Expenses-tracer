using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


public class Budget
{
    [Key]
    public long Id { get; set; }

    [StringLength(250)]
    public string Name { get; set; }

    public User Owner { get; set; }

    private double _totalIncome;
    public double TotalIncome
    {
        get => _totalIncome;
        set
        {
            if (value < 0)
            {
                throw new ArgumentException("TotalIncome cannot be negative");
            }
            _totalIncome = value;
        }
    }

    private double _totalExpenditure;
    public double TotalExpenditure
    {
        get => _totalExpenditure;
        set
        {
            if (value < 0)
            {
                throw new ArgumentException("TotalExpenditure cannot be negative");
            }
            _totalExpenditure = value;
        }
    }
    public double RemainingBalance => TotalIncome - TotalExpenditure;

    public Wallet Wallet { get; set; }
    public Category BudgetCategory { get; set; }
}