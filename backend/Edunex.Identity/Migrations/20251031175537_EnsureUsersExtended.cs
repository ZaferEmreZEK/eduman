using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edunex.Identity.Migrations
{
    /// <inheritdoc />
    public partial class EnsureUsersExtended : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SchoolId",
                schema: "eduman",
                table: "AspNetUsers",
                newName: "InstitutionId");

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                schema: "eduman",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Role",
                schema: "eduman",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FullName",
                schema: "eduman",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Role",
                schema: "eduman",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "InstitutionId",
                schema: "eduman",
                table: "AspNetUsers",
                newName: "SchoolId");
        }
    }
}
