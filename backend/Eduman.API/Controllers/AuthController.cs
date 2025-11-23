using Edunex.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Eduman.Domain.Entities;

namespace Eduman.API.Controllers;

/// <summary>
///     Kullanıcı kayıt ve giriş işlemleri için JWT üreten controller.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController(UserManager<AppUser> users, IConfiguration cfg) : ControllerBase
{
    /// <summary>
    ///     Yeni kullanıcı kaydı oluşturur. Identity doğrulama hatalarını ProblemDetails ile döndürür.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var user = new AppUser { UserName = dto.Email, Email = dto.Email, Status = UserStatus.Active };
        var result = await users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return Problem(title: "RegistrationFailed", detail: string.Join(";", result.Errors.Select(e => e.Description)),
                           statusCode: StatusCodes.Status400BadRequest);

        return Ok(new { user.Id, user.Email });
    }

    /// <summary>
    ///     Kullanıcı girişini doğrular ve başarılı ise erişim tokenı döndürür.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await users.FindByEmailAsync(dto.Email);
        if (user is null || !(await users.CheckPasswordAsync(user, dto.Password)))
            return Problem(title: "InvalidCredentials", detail: "E-posta veya şifre hatalı.",
                           statusCode: StatusCodes.Status401Unauthorized);

        var token = CreateJwt(user, cfg);
        return Ok(new { access_token = token });
    }

    /// <summary>
    ///     Kullanıcı bilgilerini içeren imzalı JWT üretir.
    /// </summary>
    private static string CreateJwt(AppUser user, IConfiguration cfg)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty)
        };
        var jwt = new JwtSecurityToken(
            issuer: cfg["Jwt:Issuer"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(int.Parse(cfg["Jwt:AccessTokenLifetimeDays"] ?? "30")),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}

/// <summary>
///     Kayıt isteği gövdesi.
/// </summary>
public record RegisterDto(string Email, string Password);

/// <summary>
///     Giriş isteği gövdesi.
/// </summary>
public record LoginDto(string Email, string Password);
