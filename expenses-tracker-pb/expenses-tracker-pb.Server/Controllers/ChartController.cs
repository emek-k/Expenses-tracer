using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("/api/chart")]
public class ChartController : Controller
{
    private readonly ETDbContext _dbContext;

    public ChartController(ETDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    [Authorize]
    [HttpGet("getChart1")]
    public async Task<IActionResult> getChart1()
    {
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            return new UnauthorizedObjectResult("");
        }

        IEnumerable<Wallet> wallets = _dbContext.Wallets.Where(x => x.UserId == userId).Include(x => x.Incomes).Include(x => x.Expenditures).ToList();

        double incomes = 0;
        double expenditures = 0;

        foreach (Wallet wallet in wallets)
        {
            incomes += wallet.Incomes.Sum(x => x.Amount);
            expenditures += wallet.Expenditures.Sum(x => x.Amount);
        }

        List<double> result = new List<double> { incomes, expenditures };

        return new JsonResult(result);
    }

    [Authorize]
    [HttpGet("getChart2")]
    public async Task<IActionResult> GetChart2()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = _dbContext.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null)
            return null;

        List<Category> expenditureCategories = _dbContext.Categories.Where(x => (x.Type == CategoryType.Expenditure) && (x.UserId == user.Id || x.UserId == null)).ToList();

        Dictionary<string, double> categoryExpenses = new Dictionary<string, double>();
        foreach (Category category in expenditureCategories)
        {
            double totalExpense = _dbContext.Expenditures
                .Where(e => e.CategoryId == category.Id && e.Wallet.UserId == userId)
                .Sum(e => e.Amount);

            categoryExpenses.Add(category.Name, totalExpense);
        }

        return new JsonResult(categoryExpenses);
    }
    
}
