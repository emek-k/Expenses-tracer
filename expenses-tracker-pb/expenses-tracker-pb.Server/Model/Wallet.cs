using expenses_tracker_api.Model;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


public class Wallet
{
    [Key]
    public long Id { get; set; }

    public string Name { get; set; }

    public long IconId { get; set; }

    public double AccountBalance { get; set; }
    public string UserId { get; set; }
    public User User;
    public ICollection<Expenditure> Expenditures { get; set; }
    public ICollection<Income> Incomes { get; set; }
    public ICollection<Obligation> Obligations { get; set; }
    public ICollection<Budget> Budgets { get; set; }
}