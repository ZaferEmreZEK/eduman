using System;
using Microsoft.AspNetCore.Identity;

namespace Edunex.Identity;

/// <summary>
///     Identity rolleri için Guid tabanlı basit genişletme.
/// </summary>
public class AppRole : IdentityRole<Guid> { }
