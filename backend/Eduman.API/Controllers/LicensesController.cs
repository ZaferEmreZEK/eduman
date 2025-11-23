using Eduman.Application.Dtos;
using Eduman.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Eduman.API.Controllers
{
    /// <summary>
    ///     Kurum lisanslarını yöneten REST uç noktaları. İş mantığı
    ///     <see cref="LicenseService"/> içerisinde tutulur.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class LicensesController : ControllerBase
    {
        private readonly LicenseService _service;

        public LicensesController(LicenseService service)
        {
            _service = service;
        }

        /// <summary>
        ///     Bir kuruma ait lisansları listeler.
        /// </summary>
        [HttpGet("institution/{institutionId:guid}")]
        public async Task<IActionResult> GetByInstitution(Guid institutionId)
            => Ok(await _service.GetByInstitutionAsync(institutionId));

        /// <summary>
        ///     Yeni lisans kaydı oluşturur ve oluşan entity'yi döndürür.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] LicenseDto dto)
            => Ok(await _service.AddAsync(dto));

        /// <summary>
        ///     Lisansı siler; kayıt yoksa 404 döner.
        /// </summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var ok = await _service.DeleteAsync(id);
            return ok ? NoContent() : NotFound();
        }
    }
}
