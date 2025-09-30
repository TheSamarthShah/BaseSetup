using BaseSetup.Common.Filters;
using BaseSetup.Common.Util;
using BaseSetup.Context;
using BaseSetup.Model;
using BaseSetup.Repository.Base.Common;
using BaseSetup.Repository.Base.Login;
using BaseSetup.Repository.Core;
using BaseSetup.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using NLog.Extensions.Logging;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddLogging(loggingBuilder =>
{
	loggingBuilder.ClearProviders();
	loggingBuilder.AddNLog();
});
// コンテナにサービスを追加します。
builder.Services.AddScoped<TokenGenerator>();
builder.Services.AddScoped<IDBContext, PgDBContext>();
builder.Services.AddScoped<CommonService>();
builder.Services.AddScoped<CommonRepository>();

builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<LoginRepository>();

var assembly = Assembly.GetExecutingAssembly();
// Add services to the container.

#region Table Repos
var tableRepos = assembly.GetTypes()
	.Where(t =>
		t.IsClass &&
		!t.IsAbstract &&
		t.Namespace != null &&
		t.Namespace.Contains(".Repository.Table.", StringComparison.OrdinalIgnoreCase) &&
		t.Name.EndsWith("Repository", StringComparison.Ordinal));

foreach (var repo in tableRepos)
{
	builder.Services.AddScoped(repo);
}
#endregion Table Repos

#region Form Repos
var formRepos = assembly.GetTypes()
	.Where(t =>
		t.IsClass &&
		!t.IsAbstract &&
		t.Namespace != null &&
		t.Namespace.Contains(".Repository.Page.", StringComparison.OrdinalIgnoreCase) &&
		(t.Name.EndsWith("Service", StringComparison.Ordinal) ||
		 t.Name.EndsWith("Repository", StringComparison.Ordinal)));

foreach (var repo in formRepos)
{
	builder.Services.AddScoped(repo);
}
#endregion Form Repos

#region Core Repos
builder.Services.AddScoped(typeof(ISearchDataRepository<>), typeof(SearchDataRepository<>));
builder.Services.AddScoped(typeof(ISaveDataRepository<>), typeof(SaveDataRepository<>));
builder.Services.AddScoped(typeof(IExportDataRepository<>), typeof(ExportDataRepository<>));
#endregion Core Repos

builder.Services.AddControllers(options =>
{
	// add filter for exception handling
	options.Filters.Add<ExceptionFilter>();
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

//For Production Config Load
var connectionString = builder.Configuration.GetConnectionString("PostgresConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseNpgsql(connectionString));
builder.Services.AddScoped<ConfigService>();
builder.Services.AddHttpClient();
builder.Services.AddHttpContextAccessor();

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
			ValidateAudience = false,
			ClockSkew = TimeSpan.Zero,//removes 5 min buffer
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

app.UseMiddleware<ActivityTrackingMiddleware>();

app.MapControllers();

app.Run();
