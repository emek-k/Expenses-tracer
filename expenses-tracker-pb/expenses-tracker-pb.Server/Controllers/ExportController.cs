using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using System.Numerics;
using System.Runtime.InteropServices;
using System.Security.Claims;
using System.Text.Json;

namespace _2023pz_trrepo.Controllers
{
    [ApiController]
    [Route("/api/export")]
    public class ExportController : ControllerBase
    {
        private readonly ETDbContext _dbContext;
        public ExportController(ETDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost("Wallet")]
        public IActionResult ExportWallet(string userName)
        {
            User user;
            try
            {
                user = _dbContext.Users.Where(x => x.UserName!.Equals(userName)).First();
            }
            catch (Exception e)
            {
                Console.WriteLine("No user on the list!" + e.StackTrace);
                return BadRequest("No user on the list!");
            }

            List<Wallet> userWalletList = _dbContext.Wallets.Where(x => x.UserId == user.Id).ToList();
            Console.WriteLine("Wallets of " + user.UserName);
            foreach (Wallet wallet in userWalletList)
            {
                Console.WriteLine(wallet.Name);
            }
            return Ok();
        }
        private void walletBalance(Wallet wallet){
            
            List<Income> walletIncomes = wallet.Incomes.ToList();
            List<Expenditure> walletExpenditures = wallet.Expenditures.ToList();

            double walletBalance = 0;

            foreach(Income income in walletIncomes){
                walletBalance += income.Amount;
            }
            
            foreach(Expenditure expenditure in walletExpenditures){
                walletBalance -= expenditure.Amount;
            }
            
            wallet.AccountBalance = walletBalance;
        }
        private void addIncomesToWallet(Wallet wallet){
            long id = wallet.Id;
            List<Income> walletIncomes = _dbContext.Incomes.Where(x => x.WalletId.Equals(id)).ToList();
            wallet.Incomes = walletIncomes;
        }

        private void addExpendituresToWallet(Wallet wallet){
            long id = wallet.Id;
            List<Expenditure> walletExpenditures = _dbContext.Expenditures.Where(x => x.WalletId.Equals(id)).ToList();
            wallet.Expenditures = walletExpenditures;
        }

        [HttpPost("Wallets")]
        public IActionResult GetUserWallets()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return StatusCode(401, "The user is not logged in!");
            }   
            
            List<Wallet> userWalletList = _dbContext.Wallets.Where(x => x.UserId.Equals(userId)).ToList();

            foreach(Wallet wallet in userWalletList){
                addIncomesToWallet(wallet);
                addExpendituresToWallet(wallet);
                walletBalance(wallet);
            }

            if(userWalletList.Count() == 0){
                return StatusCode(404, "No wallets found!");
            }

            string serializeWallets = JsonSerializer.Serialize(userWalletList);
            return Ok(serializeWallets);
        }

        [HttpPost("numberOfIncomesInWallet")]
        public IActionResult numberOfIncomesInWallet([FromBody] int walletId)
        {
            List<Income> walletIncomes = _dbContext.Incomes.Where(x => x.WalletId == walletId).ToList();
            int numberOfIncomes = walletIncomes.Count;
            
            Console.WriteLine("Number of incomes for wallet id " + walletId + " is: " + numberOfIncomes);
            string serializedNumberOfIncomes = JsonSerializer.Serialize(numberOfIncomes);
            return Ok(serializedNumberOfIncomes);
        }

        [HttpPost("numberOfExpendituresInWallet")]
        public IActionResult numberOfExpendituresInWallet([FromBody] int walletId)
        {
            List<Expenditure> walletExpenditures = _dbContext.Expenditures.Where(x => x.WalletId == walletId).ToList();
            int numberOfExpenditures = walletExpenditures.Count;
            
            Console.WriteLine("Number of expenditures for wallet id " + walletId + " is: " + numberOfExpenditures);
            string serializedNumberOfExpenditures = JsonSerializer.Serialize(numberOfExpenditures);
            return Ok(serializedNumberOfExpenditures);
        }

        [HttpPost("test")]
        public IActionResult Test()
        {
            Console.WriteLine("ExportController test OK()...");
            return Ok();
        }
    }
}