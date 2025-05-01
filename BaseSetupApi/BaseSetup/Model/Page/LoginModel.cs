namespace BaseSetup.Model.Page
{
    public class LoginModel
    {
        public string? Userid { get; set; }
        public string? Username { get; set; }
        public string? Jwttoken { get; set; }
        public string? Refreshtoken { get; set; }
        public int? JwttokenExpiry { get; set; }

        public class Search
        {
            public string Userid { get; set; }
            public string Password { get; set; }
        }
    }
}
