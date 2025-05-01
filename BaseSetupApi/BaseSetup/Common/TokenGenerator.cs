using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BaseSetup.Common
{
    public class TokenGenerator(IConfiguration configuration)
    {
        private readonly IConfiguration configuration = configuration;

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32]; // 32 bytes = 256-bit token
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
            }
            return Convert.ToBase64String(randomNumber);
        }

        /// <summary>
        /// JWT用秘密キーの生成
        /// </summary>
        /// <param name="username">ログインユーザーID</param>
        /// <returns></returns>
        public string GenerateJWTToken(string username)
        {
            var jwtsetting = configuration.GetSection("JwtConfig");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtsetting["Key"]));
            var issuer = jwtsetting["Issuer"];
            var expireMinutes = int.Parse(jwtsetting["TokenValidityMins"]);
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken
            (
                issuer: issuer,
                claims: claims,
                expires: DateTime.Now.AddMinutes(expireMinutes),
                signingCredentials: credentials

            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
