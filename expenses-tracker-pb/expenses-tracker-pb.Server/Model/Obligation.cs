using OfficeOpenXml.FormulaParsing.Excel.Functions.DateTime;

namespace expenses_tracker_api.Model
{
    public class Obligation
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Amount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime DueDate { get; set; }
        public long CategoryId { get; set; }
        public long CategoryRepaymentId { get; set; }
        public Category? Category { get; set; }

        public Wallet Wallet;
    }
}
