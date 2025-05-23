using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using NLog.Extensions.Logging;
using NLog.Web;
using System.Text;
using BaseSetup.Common;
using Microsoft.OpenApi.Models;
using BaseSetup.Repository.Base.Login;
using BaseSetup.Repository.Core;
using BaseSetup.Context;
using BaseSetup.Repository.Shared.Common;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddLogging(loggingBuilder =>
{
    loggingBuilder.ClearProviders();
    loggingBuilder.AddNLog();
});
builder.Services.AddScoped<TokenGenerator>();
builder.Services.AddScoped<IDBContext, SqlDBContext>();
builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<LoginRepository>();
builder.Services.AddScoped<CommonService>();
builder.Services.AddScoped<CommonRepository>();

#region Core Repos
builder.Services.AddScoped(typeof(ISearchDataRepository<>), typeof(SearchDataRepository<>));
builder.Services.AddScoped(typeof(ISaveDataRepository<>), typeof(SaveDataRepository<>));
builder.Services.AddScoped(typeof(IExportDataRepository<>), typeof(ExportDataRepository<>));
#endregion Core Repos

builder.Services.AddScoped<TokenGenerator>();
builder.Services.AddControllers(options =>
{
    // add filter for exception handling
    options.Filters.Add<ExceptionFilter>();
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    // Add CORS support for Swagger UI
    c.AddSecurityDefinition("CORS", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Name = "Access-Control-Allow-Origin",
        Description = "CORS policy"
    });
});
//to maintain same case of all the property sent from the API
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = null; // Keep original case
    options.JsonSerializerOptions.DictionaryKeyPolicy = null;
});

// CORS を追加 - すべてのオリジンを許可します
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin() // すべての起源を許可
                .AllowAnyMethod() // 任意の HTTP メソッド (GET、POST など) を許可します。
                .AllowAnyHeader(); // 任意のHTTPヘッダーを許可
    });
});
// JWTの構成
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtConfig:Key"])),
            ValidIssuer = builder.Configuration["JwtConfig:Issuer"],
            ValidateAudience = false
        };
    });
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
