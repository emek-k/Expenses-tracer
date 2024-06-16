namespace expenses_tracker_api.Model
{
    public class RepayEntry
    {
        public int Id { get; set; }

        public int Amount { get; set; }

        public DateTime AddDate { get; set; }

        public Obligation Obligation { get; set; }
    }
}
