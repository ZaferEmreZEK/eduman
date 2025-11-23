using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Eduman.Application.Services;
using Eduman.Application.Dtos;

namespace Eduman.API.Controllers
{
    /// <summary>
    ///     Identity tabanlı kullanıcı yönetimi uç noktaları. Tüm iş mantığı
    ///     <see cref="UserService"/> aracılığıyla yürütülür.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UserService _service;

        public UsersController(UserService service)
        {
            _service = service;
        }

        /// <summary>
        ///     Access token içindeki kimlik bilgilerine göre mevcut kullanıcıyı döndürür.
        /// </summary>
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _service.GetByIdAsync(Guid.Parse(userId));
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        /// <summary>
        ///     İsteğe bağlı filtre parametreleriyle kullanıcı listesini döndürür.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] Guid? institutionId, [FromQuery] string? role, [FromQuery] string? status, [FromQuery] string? q)
        {
            var users = await _service.GetAllAsync(institutionId, role, status, q);
            return Ok(users);
        }

        /// <summary>
        ///     Yeni kullanıcı oluşturur; parola query string ile alınır.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserDto dto, [FromQuery] string password)
        {
            var created = await _service.AddAsync(dto, password);
            return Ok(created);
        }

        /// <summary>
        ///     Kullanıcı profilini günceller.
        /// </summary>
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UserDto dto)
        {
            var ok = await _service.UpdateAsync(id, dto);
            return ok ? NoContent() : NotFound();
        }

        /// <summary>
        ///     Kullanıcıyı siler; bulunamazsa 404 döner.
        /// </summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var ok = await _service.DeleteAsync(id);
            return ok ? NoContent() : NotFound();
        }
    }
}
