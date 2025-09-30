namespace BaseSetup.Model.Page.Login
{
    public class LoginModel
    {
        public string? Userid { get; set; }
        public string? Username { get; set; }
		public string? Chargecd { get; set; }
		public string? Chargenm { get; set; }
		public string? Jwttoken { get; set; }
        public string? Refreshtoken { get; set; }

        public class Search
        {
            public string Userid { get; set; }
            public string Password { get; set; }
        }
    }
}
