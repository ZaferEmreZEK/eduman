using Microsoft.AspNetCore.Mvc;
using Eduman.Application.Services;
using Eduman.Application.Dtos;

namespace Eduman.API.Controllers
{
    /// <summary>
    ///     Sınıf CRUD operasyonlarını HTTP uç noktalarına açar. Tüm iş mantığı
    ///     ClassService'e deleger edilir; controller sadece istek/yanıt çevirisini yapar.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ClassesController : ControllerBase
    {
        private readonly ClassService _service;

        public ClassesController(ClassService service) => _service = service;

        /// <summary>
        ///     Bir okul altında tanımlı tüm sınıfları listeler.
        /// </summary>
        [HttpGet("school/{schoolId:guid}")]
        public async Task<IActionResult> GetBySchool(Guid schoolId)
            => Ok(await _service.GetBySchoolAsync(schoolId));

        /// <summary>
        ///     Yeni sınıf oluşturur ve kaydı döndürür.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ClassDto dto)
            => Ok(await _service.AddAsync(dto));

        /// <summary>
        ///     İstenen sınıfı siler; kayıt yoksa 404 döner.
        /// </summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var ok = await _service.DeleteAsync(id);
            return ok ? NoContent() : NotFound();
        }
    }
}
