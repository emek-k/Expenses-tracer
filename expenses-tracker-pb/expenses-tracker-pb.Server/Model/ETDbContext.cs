using expenses_tracker_api.Model;
using expenses_tracker_pb.Server.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class ETDbContext : DbContext
{
    public ETDbContext() {; }
    public ETDbContext(DbContextOptions<ETDbContext> options) : base(options) { }
    public virtual DbSet<Income> Incomes { get; set; }
    public DbSet<User> Users { get; set; }
    public virtual DbSet<Expenditure> Expenditures { get; set; }
    public virtual DbSet<Wallet> Wallets { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Obligation> Obligations { get; set; }
    public DbSet<RepayEntry> RepayEntries { get; set; }
    public DbSet<Budget> Budgets { get; set; }
    public DbSet<SecurityQuestion> SecurityQuestions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasKey(x => x.Id);
        modelBuilder.Entity<User>().Property(x => x.Id).ValueGeneratedOnAdd();

        modelBuilder.Entity<Wallet>().HasKey(x => x.Id);
        modelBuilder.Entity<Wallet>()
            .HasOne(w => w.User)
            .WithMany(u => u.Wallets)
            .HasForeignKey(w => w.UserId);

        modelBuilder.Entity<Category>(x =>
        {
            x.HasKey(c => c.Id);
        });

        modelBuilder.Entity<Income>(x =>
        {
            x.HasKey(i => i.Id);
            x.HasOne(i => i.Wallet)
            .WithMany(w => w.Incomes)
            .HasForeignKey(i => i.WalletId);
            x.HasOne(i => i.Category)
           .WithMany()
           .HasForeignKey(i => i.CategoryId);
            x.Property(x => x.Date).HasColumnType("Date");
        });

        modelBuilder.Entity<Expenditure>(x =>
        {
            x.HasKey(e => e.Id);
            x.HasOne(e => e.Wallet)
            .WithMany(w => w.Expenditures)
            .HasForeignKey(e => e.WalletId);
            x.HasOne(e => e.Category)
           .WithMany()
           .HasForeignKey(e => e.CategoryId);
            x.Property(x => x.Date).HasColumnType("Date");
        });

        modelBuilder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
        modelBuilder.Entity<IdentityUserRole<string>>(b =>
        {
            b.HasKey(ur => new { ur.UserId, ur.RoleId });
            b.ToTable("UserRoles");
        });

        modelBuilder.Entity<IdentityUserLogin<string>>(b =>
        {
            b.HasKey(x => new { x.LoginProvider, x.ProviderKey });
            b.ToTable("UserLogins");
        });

        modelBuilder.Entity<IdentityUserToken<string>>(b =>
        {
            b.HasKey(ut => new { ut.UserId, ut.LoginProvider, ut.Name });
            b.ToTable("UserTokens");
        });

        modelBuilder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims");
        modelBuilder.Entity<IdentityRole>().ToTable("Roles");

        // Default security questions
        modelBuilder.Entity<SecurityQuestion>().HasData(
            new SecurityQuestion
            {
                Id = 1,
                Question = "What city were you born in?",
            },
            new SecurityQuestion
            {
                Id = 2,
                Question = "What is your oldest sibling’s middle name?",
            },
            new SecurityQuestion
            {
                Id = 3,
                Question = "What was the make and model of your first car?",
            }
        );

        modelBuilder.Entity<Category>().HasData(
             new Category { Id = 1, Name = "Clothes", Type = CategoryType.Expenditure, IsDefault = true, IconId = 1, UserId = null },
             new Category { Id = 2, Name = "Food", Type = CategoryType.Expenditure, IsDefault = true, IconId = 2, UserId = null },
             new Category { Id = 3, Name = "Work", Type = CategoryType.Income, IsDefault = true, IconId = 3, UserId = null }
         );

        base.OnModelCreating(modelBuilder);
    }
}
