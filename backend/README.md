# Edunex Backend Reference Guide

This document is a guided tour through the Edunex solution.  It explains how each
project fits into the whole, how requests travel through the stack, and which
conventions the codebase relies on.  The goal is to help a new contributor move
from zero context to full-stack understanding without needing to cross-reference
multiple files.

---

## 1. Solution Map

The solution is organised as a set of layered projects.  Each layer has a clear
responsibility and only depends on the layers beneath it.

```text
Edulink.API/           Lightweight service surface for Edulink integrations
Edulink.Application/   Application layer for Edulink (currently stubs)
Edulink.Domain/        Domain models specific to Edulink
Edulink.Infrastructure Infrastructure plumbing for Edulink (currently stubs)

Eduman.API/            Primary HTTP API surface consumed by the frontend
Eduman.Application/    Application layer: DTOs, domain services, guards
Eduman.Domain/         Core domain entities shared across the organisation
Eduman.Infrastructure  EF Core DbContext, repositories, interceptors

Edunex.Identity/       ASP.NET Identity models and DbContext
Edunex.SharedKernel/   Base entities + repository/unit-of-work contracts
Edunex.EventBus/       Placeholder for future integration events
```

> 🔁 **Dependency rule**: Upper layers depend on lower layers, but not vice
> versa.  For example the API projects reference Application, which references
> SharedKernel and Domain, while the Infrastructure project references Domain
> and SharedKernel to provide concrete implementations.

---

## 2. Runtime Composition (`Program.cs`)

Both API projects bootstrap their dependencies inside `Program.cs` using the
ASP.NET Core hosting model.

### Eduman.API

1. **Database registration** – `EdumanDb` (business data) and `IdentityDb`
   (authentication) are registered against the same PostgreSQL connection string
   so the application and identity schemas live side by side. 【F:Eduman.API/Program.cs†L16-L30】
2. **Identity configuration** – `AddIdentityCore<AppUser>` sets password
   policies and wires entity framework stores over `IdentityDb`. 【F:Eduman.API/Program.cs†L32-L41】
3. **JWT authentication** – Token validation parameters are loaded from
   configuration; issuer is enforced, lifetime is exact (`ClockSkew = 0`). 【F:Eduman.API/Program.cs†L43-L61】
4. **CORS policy** – Allows localhost frontends on port 5173 to send credentials
   and custom headers. 【F:Eduman.API/Program.cs†L63-L75】
5. **Problem Details & JSON** – Hellang ProblemDetails renders RFC7807 responses
   and a custom `DateOnlyJsonConverter` handles `DateOnly` values in payloads.
   【F:Eduman.API/Program.cs†L77-L96】
6. **Infrastructure services** – Generic repository, unit of work and audit
   interceptor are added to the container along with all Application services.
   【F:Eduman.API/Program.cs†L98-L111】
7. **Middleware pipeline** – HTTPS redirection → CORS → authentication →
   authorisation → ProblemDetails, with Swagger hosted at the root in
   development. 【F:Eduman.API/Program.cs†L115-L145】

### Edulink.API

Edulink currently exposes only a minimal surface: controllers, OpenAPI support,
HTTPS redirection and authorisation middleware, keeping the door open for future
endpoints. 【F:Edulink.API/Program.cs†L1-L30】

---

## 3. Shared Kernel (Cross-cutting Contracts)

`Edunex.SharedKernel` defines abstractions that every bounded context reuses:

- **BaseEntity / BaseAuditableEntity** – Provide integer identity, soft-delete
  hooks and audit timestamps (`CreatedAt`, `UpdatedAt`, `CreatedBy`,
  `ModifiedBy`).  Audit-aware entities rely on infrastructure interceptors to
  populate metadata automatically. 【F:Edunex.SharedKernel/BaseEntity.cs†L1-L40】【F:Edunex.SharedKernel/BaseAuditableEntity.cs†L1-L52】
- **IRepository&lt;T&gt;** – Async CRUD contract returning `Result<T>` wrappers so
  services can track success/failure without throwing exceptions. 【F:Edunex.SharedKernel/IRepository.cs†L1-L88】
- **IUnitOfWork** – Commits pending changes through a single
  `SaveChangesAsync` entry point, abstracting the underlying DbContext. 【F:Edunex.SharedKernel/IUnitOfWork.cs†L1-L24】

These abstractions are implemented in Infrastructure and consumed by the
Application layer to keep domain logic persistence-agnostic.

---

## 4. Domain Model (Eduman)

`Eduman.Domain/Entities/Entities.cs` holds the core business concepts:

- **Institution** – Represents a customer organisation; tracks address, type,
  tenant identifier and licence relationship. 【F:Eduman.Domain/Entities/Entities.cs†L7-L77】
- **School / Class** – Nested structure under an institution, with navigations
  removed from serialisation via `JsonIgnore` to avoid circular references.
  【F:Eduman.Domain/Entities/Entities.cs†L79-L162】
- **Licence & LicenceUsage** – Captures subscription limits, validity windows
  (`DateOnly`), and current usage counters. 【F:Eduman.Domain/Entities/Entities.cs†L164-L236】
- **Role / Permission / RolePermission** – Coarse grained authorisation model
  defining what actions are allowed per role. 【F:Eduman.Domain/Entities/Entities.cs†L238-L322】

All entities inherit from the shared kernel base classes, so they automatically
participate in auditing and follow consistent identity semantics.

---

## 5. Infrastructure (Eduman)

### Database Context

`EdumanDb` exposes DbSet properties for every domain aggregate and configures
schema details such as the `eduman` schema, unique indexes, enum conversions and
column types for dates. 【F:Eduman.Infrastructure/EdumanDb.cs†L1-L86】

### Repository + Unit of Work

- `EfRepository<T>` implements the shared repository contract using EF Core’s
  async APIs.  It encapsulates list, find, add, update and delete operations and
  wraps results in FluentResults. 【F:Eduman.Infrastructure/EfRepository.cs†L1-L128】
- `UnitOfWork` forwards `SaveChangesAsync` to the DbContext and centralises
  transaction boundaries. 【F:Eduman.Infrastructure/UnitOfWork.cs†L1-L43】

### Audit Interceptor

`AuditSaveChangesInterceptor` inspects tracked entities derived from
`BaseAuditableEntity` during `SaveChanges`, automatically populating audit
fields without polluting business logic. 【F:Eduman.Infrastructure/Interceptors/AuditSaveChangesInterceptor.cs†L1-L92】

### Migrations

The `Migrations/` folder stores EF Core-generated schema evolution scripts.
Applying them (`dotnet ef database update`) builds the `eduman` schema with all
entities, relationships, seed data, and type conversions exactly as configured
in the DbContext.

---

## 6. Identity Layer

`Edunex.Identity` extends ASP.NET Identity to align user storage with the domain
model:

- **AppUser** – Adds `FullName`, `InstitutionId`, `DefaultRole` and `Status`
  (enum shared with the domain) to the standard Identity user. 【F:Edunex.Identity/AppUser.cs†L1-L84】
- **AppRole** – Placeholder for custom role metadata. 【F:Edunex.Identity/AppRole.cs†L1-L36】
- **IdentityDb** – Configures Identity tables to live in the `eduman` schema and
  maps the `UserStatus` enum to an integer column. 【F:Edunex.Identity/IdentityDb.cs†L1-L82】

Because the API registers this DbContext alongside `EdumanDb`, transactions can
coordinate business data with identity operations where needed.

---

## 7. Application Layer (Eduman)

### DTOs

DTOs in `Eduman.Application/Dtos/` describe HTTP payloads.  They flatten
navigations, expose only the fields required by the frontend, and keep domain
entities detached from presentation concerns. 【F:Eduman.Application/Dtos/InstitutionDto.cs†L1-L44】【F:Eduman.Application/Dtos/SchoolDto.cs†L1-L43】【F:Eduman.Application/Dtos/ClassDto.cs†L1-L40】【F:Eduman.Application/Dtos/UserDto.cs†L1-L58】【F:Eduman.Application/Dtos/RoleDto.cs†L1-L57】【F:Eduman.Application/Dtos/LicenseDto.cs†L1-L67】

### Services

Each service orchestrates repository calls, guards and unit-of-work commits.
Examples:

- **InstitutionService** – Creates, updates and queries institutions via the
  generic repository, ensuring tenant scoping and returning results wrapped in
  FluentResults. 【F:Eduman.Application/Services/InstutionService.cs†L1-L140】
- **SchoolService / ClassService** – Handle child aggregates filtered by
  `InstitutionId`, coordinating save operations with the unit of work.
  【F:Eduman.Application/Services/SchoolService.cs†L1-L161】【F:Eduman.Application/Services/ClassService.cs†L1-L168】
- **UserService** – Bridges ASP.NET Identity with domain repositories to create
  users, assign roles, and read profile information. 【F:Eduman.Application/Services/UserService.cs†L1-L220】
- **RoleService** – Manages roles and permissions, projecting domain entities
  into DTOs for the API surface. 【F:Eduman.Application/Services/RoleService.cs†L1-L220】
- **LicenceService** – Coordinates licence CRUD and enforces usage limits via
  the `LicenseGuard`. 【F:Eduman.Application/Services/LicenceService.cs†L1-L193】【F:Eduman.Application/Services/LicenseGuard.cs†L1-L168】
- **ReportsService** – Aggregates dashboard metrics by combining repository
  queries, projecting summarised data for the frontend. 【F:Eduman.Application/Services/ReportsService.cs†L1-L188】

All services are registered through the `AddApplicationServices()` extension so
controllers can request them via constructor injection. 【F:Eduman.Application/DependencyInjection.cs†L1-L66】

### Guards and Helpers

`LicenseGuard` ensures new classes/users do not exceed licence quotas before the
unit of work commits.  It is injected into services that need to respect licence
limits. 【F:Eduman.Application/Services/LicenseGuard.cs†L1-L168】

---

## 8. API Layer

### Controllers

Controllers translate HTTP requests into service calls while keeping minimal
logic in the presentation layer.

- **AuthController** – Handles registration and login, issues JWTs using the
  identity services configured in `Program.cs`. 【F:Eduman.API/Controllers/AuthController.cs†L1-L219】
- **InstitutionsController / SchoolsController / ClassesController** – CRUD
  endpoints that delegate to their corresponding services and return DTOs.
  【F:Eduman.API/Controllers/InstituonsController.cs†L1-L146】【F:Eduman.API/Controllers/SchoolsController.cs†L1-L166】【F:Eduman.API/Controllers/ClassesController.cs†L1-L169】
- **LicensesController / UsersController / RolesController** – Expose licence
  management, user onboarding and role-permission administration. 【F:Eduman.API/Controllers/LicensesController.cs†L1-L163】【F:Eduman.API/Controllers/UsersController.cs†L1-L200】【F:Eduman.API/Controllers/RolesController.cs†L1-L210】
- **ReportsController (via ReportsService)** – Provides dashboard data consumed
  by frontend analytics (see `ReportsService`).

Controllers rely purely on DTOs for request/response contracts; domain entities
never leave the application layer.

### Helpers

`DateOnlyJsonConverter` enables native `DateOnly` serialisation, keeping JSON
payloads clean while mapping directly to C# date types. 【F:Eduman.API/Helpers/DateOnlyJsonConverter.cs†L1-L50】

---

## 9. Request Lifecycle Examples

### Read Scenario – List Schools for an Institution

```plantuml
@startuml
actor Frontend
Frontend -> SchoolsController : GET /api/schools/institution/{id}
SchoolsController -> SchoolService : GetByInstitutionAsync(id)
SchoolService -> IRepository<School> : ListAsync(filter)
IRepository<School> --> SchoolService : List<School>
SchoolService --> SchoolsController : Result<List<SchoolDto>>
SchoolsController --> Frontend : 200 OK + DTO array
@enduml
```

Key observations:

1. Controllers call services, not repositories directly.
2. Services query the repository with predicates (kept server-side).
3. DTO projection happens before the response, ensuring API contracts are
   presentation-friendly.

### Write Scenario – Create Institution

```plantuml
@startuml
actor Admin
Admin -> InstitutionsController : POST /api/institutions (InstitutionDto)
InstitutionsController -> InstitutionService : AddAsync(dto)
InstitutionService -> IRepository<Institution> : AddAsync(entity)
IRepository<Institution> --> InstitutionService : Result<Institution>
InstitutionService -> IUnitOfWork : SaveChangesAsync()
IUnitOfWork -> EdumanDb : SaveChangesAsync()
EdumanDb -> AuditInterceptor : SavingChangesAsync()
AuditInterceptor --> EdumanDb : Set audit fields
InstitutionService --> InstitutionsController : Result<InstitutionDto>
InstitutionsController --> Admin : 201 Created + DTO
@enduml
```

Audit metadata is filled in transparently by the interceptor, and services
return FluentResults so controllers can branch on success or failure when
producing HTTP responses.

### Authentication Scenario – Login

1. `AuthController.Login` validates credentials against `UserManager<AppUser>`.
2. On success, a JWT is created (issuer/key from configuration) with user claims
   including `sub`, `email`, `institutionId`, `role`.
3. The token is returned to the frontend, which stores it (typically in memory)
   and attaches it to subsequent requests via the `Authorization: Bearer` header.
4. The JWT middleware validates the token on each request, populating `User` on
   the `HttpContext` for downstream services to consume.

---

## 10. Development Workflow

1. **Prerequisites** – .NET 8 SDK, PostgreSQL instance, and the `dotnet-ef`
   global tool if migrations need to be created or applied.
2. **Configuration** – Set the `Eduman` connection string and JWT settings in
   `appsettings.{Environment}.json`.
3. **Database** – Run `dotnet ef database update -s Eduman.API -p Eduman.Infrastructure`
   to apply migrations to the configured database.
4. **Run API** – `dotnet run --project Eduman.API` starts the primary backend on
   `https://localhost:5001` (default Kestrel port).
5. **Swagger** – Navigate to `/` in development to explore endpoints and test
   payloads via Swagger UI.
6. **Edulink Service** – Start with `dotnet run --project Edulink.API` when its
   integrations are ready; at the moment it hosts only scaffolding endpoints.

---

## 11. Extending the System

- **New domain concepts** – Create entities under `Eduman.Domain`, generate a
  migration, and expose repository functionality through a dedicated service in
  `Eduman.Application`.
- **Additional endpoints** – Add controller actions that depend on application
  services.  Keep HTTP models in DTOs to avoid leaking domain types.
- **Background processing** – Use the EventBus project as the foundation for
  publishing domain events once the integration requirements become concrete.
- **Shared features** – Place cross-cutting utilities (value objects, interfaces
  or base classes) in the SharedKernel so both Edulink and Eduman can reuse
  them.

---

## 12. Glossary

| Term | Meaning in Edunex |
| ---- | ----------------- |
| **DTO** | Data Transfer Object, used by controllers to define HTTP contracts. |
| **Repository** | Persistence abstraction that hides EF Core; implemented by `EfRepository<T>`. |
| **Unit of Work** | Coordinates `SaveChangesAsync` so multiple repository operations commit atomically. |
| **Guard** | Service-side check (e.g., `LicenseGuard`) that validates invariants before data is persisted. |
| **ProblemDetails** | RFC7807 error format produced automatically by middleware. |
| **License** | Subscription model controlling how many users/classes an institution can create. |
| **Tenant** | Each institution behaves like a tenant identified by `TenantId`. |
| **Audit fields** | `CreatedAt`, `UpdatedAt`, `CreatedBy`, `ModifiedBy` populated automatically on auditable entities. |

---

With this reference in hand you can trace any feature from HTTP entry point to
persistence.  Start by locating the relevant controller, follow its service, and
inspect the repository or DbContext configuration to understand storage details.
The shared kernel guarantees consistent patterns across the codebase, so once
you learn one flow the rest follow the same structure.
