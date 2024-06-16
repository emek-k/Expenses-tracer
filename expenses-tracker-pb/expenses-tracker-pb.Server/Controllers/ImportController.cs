using System.Diagnostics.Metrics;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using System.Text.RegularExpressions;
using System;

namespace _2023pz_trrepo.Controllers
{
    [ApiController]
    [Route("/api/import")]
    public class ImportController : ControllerBase
    {
        private readonly ETDbContext _dbContext;
        public ImportController(ETDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        private void checkWalletNames(String? currentUserId, List<ImportedWallet> importedWallets)
        {
            var currentWallets = _dbContext.Wallets.AsNoTracking().Where(x => x.UserId.Equals(currentUserId)).ToList();

            foreach (Wallet wallet in currentWallets)
            {
                int count = 1;
                foreach (ImportedWallet importedWallet in importedWallets)
                {
                    if (wallet.Name.Equals(importedWallet.Name))
                    {
                        if (wallet.Name.Contains("-Imported-"))
                        {
                            Match match = Regex.Match(importedWallet.Name, @"\d+$");
                            if (match.Success)
                            {
                                count = Int32.Parse(match.Value) + 1;
                            }
                            importedWallet.Name = importedWallet.Name.Substring(0, importedWallet.Name.Length - 1) + count;
                        }
                        else
                        {
                            importedWallet.Name = importedWallet.Name + "-Imported-" + count;
                        }
                        count++;
                    }
                }
            }
        }

        [HttpPost("importWallets")]
        public async Task<IActionResult> ImportWallets([FromBody] List<ImportedWallet> wallets)
        {
            var currentUserId = GetCurrentUserId();
            var user = await _dbContext.Users
            .Include("Wallets")
            .FirstOrDefaultAsync(u => u.Id == currentUserId);

            checkWalletNames(currentUserId, wallets);

            Console.WriteLine("Received wallets:");
            foreach (var wallet in wallets)
            {
                if (wallet != null && user != null)
                {
                    Wallet newWallet = new()
                    {
                        User = user,
                        UserId = user.Id,
                        Name = wallet.Name ?? "ImportedWallet",
                        IconId = wallet.IconId,
                        AccountBalance = (double)wallet.AccountBalance,
                        Incomes = new List<Income>(),
                        Expenditures = new List<Expenditure>(),
                    };

                    foreach (var income in wallet.Incomes)
                    {
                        Income newIncome = new()
                        {
                            Title = income.Title,
                            Description = income.Description,
                            Amount = income.Amount,
                            Date = income.Date,
                            WalletId = newWallet.Id,
                            CategoryId = income.CategoryId,
                        };

                        newWallet.Incomes.Add(newIncome);
                    }

                    foreach (var expenditure in wallet.Expenditures)
                    {
                        Expenditure newExpenditure = new Expenditure()
                        {
                            Title = expenditure.Title,
                            Description = expenditure.Description,
                            Amount = expenditure.Amount,
                            Date = expenditure.Date,
                            WalletId = newWallet.Id,
                            CategoryId = expenditure.CategoryId,
                        };

                        newWallet.Expenditures.Add(newExpenditure);
                    }
                    user.Wallets.Add(newWallet);
                }
                consoleWriteWalletDetails(wallet);
            }

            await _dbContext.SaveChangesAsync();
            Console.Write("Successfully added wallets to your user account!");

            return Ok("Successfully added wallets to your user account!");
        }

        private string? GetCurrentUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userId;
        }

        [HttpPost("user")]
        public IActionResult IsUserLogged()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return StatusCode(401, "The user is not logged in!");
            }
            return Ok();
        }

        [HttpGet("wallet")]
        public void consoleWriteWalletDetails(ImportedWallet wallet)
        {
            Console.WriteLine($"Id: {wallet.Id}, Name: {wallet.Name}, IconId: {wallet.IconId}, AccountBalance: {wallet.AccountBalance}, UserId: {wallet.UserId}");
            Console.WriteLine("Expenditures:");
            if (wallet.Expenditures != null)
            {
                foreach (var expenditure in wallet.Expenditures)
                {
                    Console.WriteLine($"  Id: {expenditure.Id}, Amount: {expenditure.Amount}, Description: {expenditure.Description}");
                }
            }

            Console.WriteLine("Incomes:");
            if (wallet.Incomes != null)
            {
                foreach (var income in wallet.Incomes)
                {
                    Console.WriteLine($"  Id: {income.Id}, Amount: {income.Amount}, Description: {income.Description}");
                }
            }

            Console.WriteLine();
        }
        [HttpPost("test")]
        public IActionResult Test()
        {
            Console.WriteLine("ImportController test OK()...");
            return Ok();
        }
    }
    public class ImportedWallet
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int IconId { get; set; }
        public decimal AccountBalance { get; set; }
        public string? UserId { get; set; }
        public List<Expenditure>? Expenditures { get; set; }
        public List<Income>? Incomes { get; set; }
        public int IncomesCount { get; set; }
        public int ExpendituresCount { get; set; }
    }
}