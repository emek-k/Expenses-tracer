using expenses_tracker_pb.Server.Model;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

public class User : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public ICollection<Wallet> Wallets { get; set; }

    // Email authentication
    public bool EmailTwoFactorAuthenticationEnabled { get; set; }
    public string? EmailTwoFactorAuthenticationCode { get; set; }
    public DateTime? EmailTwoFactorAuthenticationExpiryTime { get; set; }
    public DateTime? LastEmailTwoFactorAuthenticationCodeSent { get; set; }

    // Google authentication
    public string? GoogleAuthKey { get; set; }
    public string? ResetPasswordCode { get; set; }
    public DateTime? ResetPasswordCodeExpireTime { get; set; }
    public ICollection<Category>? UserCategories { get; set; }

    // Security question authentication
    public SecurityQuestion? SecurityQuestion { get; set; }
    public string? SecurityQuestionAnswer { get; set; }

    //[Column(TypeName = "varbinary(max)")]
    //w postgersql nie ma typu varbinary(max) zamiast tego jest bytea, na potrzeby testów zamieniłem ten kod na bytea
    [Column(TypeName = "bytea")]
    public byte[]? ProfilePicture { get; set; }
}
