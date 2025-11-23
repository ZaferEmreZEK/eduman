using Microsoft.AspNetCore.Mvc;
using Eduman.Application.Services;
using Eduman.Application.Dtos;

namespace Eduman.API.Controllers
{
    /// <summary>
    ///     Kuruma bağlı okullar için REST uç noktaları. İş mantığı SchoolService'te
    ///     bulunduğundan controller sadece HTTP protokolüyle ilgilenir.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class SchoolsController : ControllerBase
    {
        private readonly SchoolService _service;

        public SchoolsController(SchoolService service)
        {
            _service = service;
        }

        /// <summary>
        ///     Bir kuruma ait okulları listeler.
        /// </summary>
        [HttpGet("institution/{institutionId:guid}")]
        public async Task<IActionResult> GetByInstitution(Guid institutionId)
            => Ok(await _service.GetByInstitutionAsync(institutionId));

        /// <summary>
        ///     Yeni okul oluşturur ve HTTP 200 ile döndürür (frontend kaydı hemen görür).
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SchoolDto dto)
        {
            var created = await _service.AddAsync(dto);
            return Ok(created);
        }

        /// <summary>
        ///     Okul güncellemesi yapar; kayıt bulunamazsa 404 verir, aksi halde 204 döner.
        /// </summary>
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] SchoolDto dto)
        {
            var ok = await _service.UpdateAsync(id, dto);
            return ok ? NoContent() : NotFound();
        }

        /// <summary>
        ///     Okulu siler; sonuç bulunamazsa 404.
        /// </summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var ok = await _service.DeleteAsync(id);
            return ok ? NoContent() : NotFound();
        }
    }
}
