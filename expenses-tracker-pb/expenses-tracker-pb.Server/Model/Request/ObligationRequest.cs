namespace expenses_tracker_api.Model.Request
{
    public class ObligationRequest
    {
        public Obligation Obligation { get; set; }
        public int WalletId { get; set; }
        public int? CategoryId { get; set; }
        public long? CategoryRepaymentId { get; set; }
    }
}
