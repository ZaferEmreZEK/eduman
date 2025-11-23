using Microsoft.AspNetCore.Mvc;
using Eduman.Application.Services;
using Eduman.Application.Dtos;

namespace Eduman.API.Controllers
{
    /// <summary>
    ///     Roller ve izin ilişkileri için HTTP uç noktaları. Rol bazlı iş mantığı
    ///     <see cref="RoleService"/>'e delege edilir.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly RoleService _service;

        public RolesController(RoleService service)
        {
            _service = service;
        }

        /// <summary>
        ///     Tüm rolleri listeler.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _service.GetAllAsync());

        /// <summary>
        ///     Yeni rol kaydı oluşturur ve DTO döndürür.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RoleDto dto)
            => Ok(await _service.AddAsync(dto));

        /// <summary>
        ///     Rol bilgisini günceller.
        /// </summary>
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] RoleDto dto)
        {
            var ok = await _service.UpdateAsync(id, dto);
            return ok ? NoContent() : NotFound();
        }

        /// <summary>
        ///     Rolü siler; bulunamazsa 404 döner.
        /// </summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var ok = await _service.DeleteAsync(id);
            return ok ? NoContent() : NotFound();
        }

        /// <summary>
        ///     Rolün sahip olduğu izinleri döndürür.
        /// </summary>
        [HttpGet("{id:guid}/permissions")]
        public async Task<IActionResult> GetPermissions(Guid id)
            => Ok(await _service.GetPermissionsAsync(id));

        /// <summary>
        ///     Rolün izin setini tamamen yeniden yazar.
        /// </summary>
        [HttpPut("{id:guid}/permissions")]
        public async Task<IActionResult> UpdatePermissions(Guid id, [FromBody] PermissionsUpdateRequest req)
        {
            var ok = await _service.UpdatePermissionsAsync(id, req.Permissions);
            return ok ? NoContent() : NotFound();
        }
    }

    /// <summary>
    ///     Rol izinlerini güncellemek için kullanılan istek gövdesi modeli.
    /// </summary>
    public class PermissionsUpdateRequest
    {
        public List<string> Permissions { get; set; } = [];
    }
}
