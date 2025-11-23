using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Eduman.Infrastructure;

namespace Eduman.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly EdumanDb _db;
        public DashboardController(EdumanDb db) => _db = db;

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var summary = new
            {
                Institutions = await _db.Institutions.CountAsync(),
                Schools = await _db.Schools.CountAsync(),
                Classes = await _db.Classes.CountAsync(),
                Licenses = await _db.Licenses.CountAsync()
            };
            return Ok(summary);
        }
    }
}
