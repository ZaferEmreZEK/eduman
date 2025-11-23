using Microsoft.AspNetCore.Mvc;
using Eduman.Application.Services;
using Eduman.Application.Dtos;

namespace Eduman.API.Controllers
{
    /// <summary>
    /// Institution CRUD işlemlerini HTTP uç noktaları olarak sunar.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class InstitutionsController : ControllerBase
    {
        private readonly InstitutionService _service;

        public InstitutionsController(InstitutionService service)
        {
            _service = service;
        }

        /// <summary>
        /// Tüm kurumları listeler.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _service.GetAllAsync());

        /// <summary>
        /// Yeni kurum oluşturur ve oluşturulan entity'i döndürür.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] InstitutionDto dto)
        {
            var created = await _service.AddAsync(dto);
            return Ok(created);
        }

        /// <summary>
        /// Var olan kurumu günceller. Kayıt yoksa 404 döner.
        /// </summary>
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] InstitutionDto dto)
        {
            var ok = await _service.UpdateAsync(id, dto);
            return ok ? NoContent() : NotFound();
        }

        /// <summary>
        /// Kurumu siler. Başarısız olursa 404.
        /// </summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var ok = await _service.DeleteAsync(id);
            return ok ? NoContent() : NotFound();
        }
    }
}
