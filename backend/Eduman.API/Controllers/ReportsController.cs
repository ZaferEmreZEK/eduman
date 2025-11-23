using Microsoft.AspNetCore.Mvc;
using Eduman.Application.Services;

namespace Eduman.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly ReportsService _service;

        public ReportsController(ReportsService service)
        {
            _service = service;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] Guid? institutionId, [FromQuery] DateOnly? start, [FromQuery] DateOnly? end)
        {
            var result = await _service.GetSummaryAsync(institutionId, start, end);
            return Ok(result);
        }

        [HttpGet("download")]
        public IActionResult Download([FromQuery] Guid? institutionId, [FromQuery] DateOnly? start, [FromQuery] DateOnly? end, [FromQuery] string format = "pdf")
        {
            // export özelliğini sonra tamamlarız, şimdilik 204 dönelim
            return NoContent();
        }
    }
}
