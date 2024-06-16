using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using expenses_tracker_api.Model;
using expenses_tracker_api.Model.Request;
using System.Text.Json;
using DocumentFormat.OpenXml.Spreadsheet;

namespace expenses_tracker_api.Controllers
{
    [ApiController]
    [Route("/api/obligation")]
    public class ObligationsController : ControllerBase
    {
        private readonly ETDbContext _dbContext;

        public ObligationsController(ETDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [Authorize]
        [HttpPost("addObligation")]
        public async Task<IActionResult> AddObligation([FromBody] ObligationRequest obligationRequest)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized("Session ended! Sign in again");
            }

            var user = await _dbContext.Users.Include(u => u.Wallets).ThenInclude(w => w.Obligations)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized("User not found");
            }

            var wallet = user.Wallets.FirstOrDefault(w => w.Id == obligationRequest.WalletId);
            if (wallet == null)
            {
                return StatusCode(403, "Unknown wallet!");
            }

            try
            {
                var obligation = obligationRequest.Obligation;
                obligation.Wallet = wallet;

                if (obligationRequest.CategoryId.HasValue)
                {
                    var category = await _dbContext.Categories.FindAsync(obligationRequest.CategoryId);
                    if (category == null)
                    {
                        return StatusCode(404, "Category not found");
                    }
                    obligation.CategoryId = category.Id;
                }

                if (obligationRequest.CategoryRepaymentId.HasValue)
                {
                    var categoryRepayment = await _dbContext.Categories.FindAsync(obligationRequest.CategoryRepaymentId);
                    if (categoryRepayment == null)
                    {
                        return StatusCode(404, "Repayment category not found");
                    }
                    obligation.CategoryRepaymentId = categoryRepayment.Id;
                }

                wallet.Obligations.Add(obligation);
                await _dbContext.SaveChangesAsync();
                return Ok("Obligation added");
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Unable to add obligation! Error: {e.Message}");
            }
        }


        [Authorize]
        [HttpDelete("deleteObligation/{obligationId}")]
        public async Task<IActionResult> DeleteObligation(long obligationId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized("Session ended! Sign in again");
            }

            var user = await _dbContext.Users.Include(u => u.Wallets).ThenInclude(w => w.Obligations)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized("User not found");
            }

            var obligation = user.Wallets.SelectMany(w => w.Obligations).FirstOrDefault(o => o.Id == obligationId);
            if (obligation == null)
            {
                return NotFound("Obligation not found");
            }

            try
            {
                _dbContext.Remove(obligation);
                await _dbContext.SaveChangesAsync();
                return Ok("Obligation deleted");
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Unable to delete obligation! Error: {e.Message}");
            }
        }

        [Authorize]
        [HttpPost("updateObligation")]
        public async Task<IActionResult> UpdateObligation([FromBody] Obligation updatedObligation)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized("Session ended! Sign in again");
            }

            var user = await _dbContext.Users.Include(u => u.Wallets).ThenInclude(w => w.Obligations)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized("User not found");
            }

            var wallet = user.Wallets.FirstOrDefault(w => w.Obligations.Any(o => o.Id == updatedObligation.Id));
            if (wallet == null)
            {
                return StatusCode(403, "Unknown wallet or obligation!");
            }

            try
            {
                var existingObligation = wallet.Obligations.FirstOrDefault(o => o.Id == updatedObligation.Id);
                if (existingObligation == null)
                {
                    return NotFound("Obligation not found");
                }

                existingObligation.Name = updatedObligation.Name;
                existingObligation.Amount = updatedObligation.Amount;
                existingObligation.StartDate = updatedObligation.StartDate;
                existingObligation.DueDate = updatedObligation.DueDate;

                await _dbContext.SaveChangesAsync();
                return Ok("Obligation updated");
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Unable to update obligation! Error: {e.Message}");
            }
        }



        [Authorize]
        [HttpGet("getObligations/{walletId}")]
        public async Task<IActionResult> GetObligations(long walletId, string categoryName = null)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized("Session ended! Sign in again");
            }

            var user = await _dbContext.Users
                .Include(u => u.Wallets)
                    .ThenInclude(w => w.Obligations)
                        .ThenInclude(o => o.Category)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized("User not found");
            }

            var wallet = user.Wallets.FirstOrDefault(w => w.Id == walletId);
            if (wallet == null)
            {
                return StatusCode(403, "Unknown wallet!");
            }

            IQueryable<Obligation> obligationsQuery = wallet.Obligations.AsQueryable();

            if (!string.IsNullOrEmpty(categoryName))
            {
                obligationsQuery = obligationsQuery.Where(o => o.Category.Name == categoryName);
            }

            var obligations = obligationsQuery.Select(x => new ObligationDTO(x, getPaidAmount(x.Id)));
            return Ok(obligations);
        }

        private int getPaidAmount(int obligationId)
        {
            var x = _dbContext.RepayEntries.Where(x => x.Obligation.Id == obligationId);

            return x.Sum(x => x.Amount);
        }

        [Authorize]
        [HttpPost("repayObligations/{obligationId}")]
        public async Task<IActionResult> RepayObligations([FromQuery] int amount, long obligationId)
        {
            var obligations = _dbContext.Obligations.FirstOrDefault(w => w.Id == obligationId);
            RepayEntry repayEntry = new();

            repayEntry.Amount = amount;
            repayEntry.AddDate = DateTime.Now;
            repayEntry.Obligation = obligations;

            await _dbContext.RepayEntries.AddAsync(repayEntry);

            _dbContext.SaveChanges();

            return Ok(" ");
        }

        public class ObligationDTO
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public Category? Category { get; set; }
            public string Description { get; set; }
            public int Amount { get; set; }
            public int PaidAmount { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime DueDate { get; set; }

            public Wallet Wallet;

            public ObligationDTO(Obligation obligation, int paidAmount)
            {
                Id = obligation.Id;
                Name = obligation.Name;
                Description = obligation.Description;
                Amount = obligation.Amount;
                PaidAmount = paidAmount;
                Category = obligation.Category;
                Wallet = obligation.Wallet;
                StartDate = obligation.StartDate;
                DueDate = obligation.DueDate;
            }
        }
        [Authorize]
        [HttpGet("getAllObligations")]
        public async Task<IActionResult> GetAllObligations()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized("Session ended! Sign in again");
            }

            var user = await _dbContext.Users.Include(u => u.Wallets).ThenInclude(w => w.Obligations)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized("User not found");
            }

            var allObligations = user.Wallets.SelectMany(w => w.Obligations)
                .Select(o => new { Name = o.Name, DueDate = o.DueDate });

            return Ok(allObligations);
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

        private async Task AddCategoryIfNotExists(string categoryName, CategoryType categoryType)
        {
            if (_dbContext.Categories.FirstOrDefault(c => c.Name == categoryName) == null)
            {
                var category = new Category { Name = categoryName, Type = categoryType, IsDefault = true };
                _dbContext.Categories.Add(category);
                await _dbContext.SaveChangesAsync();
            }
        }

        [Authorize]
        [HttpGet("allCategories")]
        public async Task<ActionResult<List<Category>>> GetAllCategories()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized("Session ended! Sign in again");
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized("User not found");
            }

            try
            {
                await AddCategoryIfNotExists("Credit", CategoryType.Obligation);
                await AddCategoryIfNotExists("Leasing", CategoryType.Obligation);
                await AddCategoryIfNotExists("Fees", CategoryType.Obligation);
                await AddCategoryIfNotExists("Weekly", CategoryType.Repayment);
                await AddCategoryIfNotExists("Monthly", CategoryType.Repayment);
                await AddCategoryIfNotExists("Quarterly", CategoryType.Repayment);
                await AddCategoryIfNotExists("Yearly", CategoryType.Repayment);

                List<Category> categories = _dbContext.Categories
                    .Where(c => (c.UserId == user.Id || c.UserId == null))
                    .ToList();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return StatusCode(500, "Error fetching categories");
            }
        }
        [Authorize]
        [HttpGet("getRepayments/{obligationId}")]
        public async Task<IActionResult> GetRepayments(int obligationId)
        {
            var repayments = await _dbContext.RepayEntries
                .Where(r => r.Obligation.Id == obligationId)
                .ToListAsync();

            return Ok(repayments);
        }
        [Authorize]
        [HttpGet("getObligation/{obligationId}")]
        public async Task<IActionResult> GetObligation(long obligationId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized("Session ended! Sign in again");
            }

            var user = await _dbContext.Users
                .Include(u => u.Wallets)
                    .ThenInclude(w => w.Obligations)
                        .ThenInclude(o => o.Category)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return Unauthorized("User not found");
            }

            var obligation = user.Wallets
                .SelectMany(w => w.Obligations)
                .FirstOrDefault(o => o.Id == obligationId);

            if (obligation == null)
            {
                return NotFound("Obligation not found");
            }

            return Ok(new ObligationDTO(obligation, getPaidAmount(obligation.Id)));
        }

    }
}
