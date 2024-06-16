using System.Net.Mail;
using System.Net;
using System.Text;

public class EmailSender
{
    private readonly IConfiguration _configuration;
    private readonly SmtpClient _client;

    public EmailSender(IConfiguration configuration) {
        _configuration = configuration;

        // Reading Smtp config
        var smtpConfiguration = _configuration.GetSection("Smtp");

        // SMTP Client configuration
        _client = new SmtpClient
        {
            Host = smtpConfiguration["Url"],
            Port = int.Parse(smtpConfiguration["Port"]),
            EnableSsl = true,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(
                smtpConfiguration["Credentials:UserEmail"],
                smtpConfiguration["Credentials:Password"]
            )
        };
    }

    public void sendPasswordRecoveryCode(string receiver, string code)
    {
        // Subject
        string Subject = "ExpensesTracker - Reset password code";

        // Body
        StringBuilder mailBody = new StringBuilder();
        mailBody.Append("<p>Password Reset</p>");

        mailBody.AppendFormat("<strong>Your code is: {0}</strong>", code);

        mailBody.Append("<p>This code will expire after 5 minutes for security reasons.</p>");
        mailBody.Append("<p>If you did not request this password reset, please ignore this email.</p>");
        mailBody.Append("<p>Thank you for using ExpensesTracker!</p>");
        mailBody.Append("<p>Best Regards,<br/>The ExpensesTracker Team</p>");

        // Send email
        SendEmail(receiver, Subject , mailBody.ToString() );
    }

    public void SendTwoFactorAuthenticationCode(string receiver, string code)
    {
        // Subject
        string subject = "ExpensesTracker - Two-Factor Authentication Code";

        // Body
        StringBuilder mailBody = new StringBuilder();
        mailBody.Append("<p>Two-Factor Authentication Code</p>");
        mailBody.AppendFormat("<p>Your verification code is: <strong>{0}</strong></p>", code);

        mailBody.Append("<p>This code will expire after 5 minutes for security reasons.</p>");
        mailBody.Append("<p>If you did not request this code, please ignore this email.</p>");
        mailBody.Append("<p>Thank you for using ExpensesTracker!</p>");
        mailBody.Append("<p>Best Regards,<br/>The ExpensesTracker Team</p>");

        // Send email
        SendEmail(receiver, subject, mailBody.ToString());
    }

    private void SendEmail(string receiver, string subject, string body)
    {
        // Message content
        MailMessage mailMessage = new MailMessage();
        mailMessage.From = new MailAddress(_configuration.GetValue<string>("Smtp:Credentials:UserEmail"));
        mailMessage.To.Add(receiver);
        mailMessage.Subject = subject;
        mailMessage.IsBodyHtml = true;
        mailMessage.Body = body;

        // Execute
        _client.Send(mailMessage);
    }
}
