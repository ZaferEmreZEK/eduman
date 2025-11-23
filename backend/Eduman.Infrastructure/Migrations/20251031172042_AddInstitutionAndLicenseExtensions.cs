using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduman.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInstitutionAndLicenseExtensions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BranchCount",
                schema: "eduman",
                table: "Schools",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "eduman",
                table: "Licenses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                schema: "eduman",
                table: "Licenses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsedUsers",
                schema: "eduman",
                table: "Licenses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                schema: "eduman",
                table: "Institutions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                schema: "eduman",
                table: "Institutions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BranchCount",
                schema: "eduman",
                table: "Schools");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "eduman",
                table: "Licenses");

            migrationBuilder.DropColumn(
                name: "Type",
                schema: "eduman",
                table: "Licenses");

            migrationBuilder.DropColumn(
                name: "UsedUsers",
                schema: "eduman",
                table: "Licenses");

            migrationBuilder.DropColumn(
                name: "Address",
                schema: "eduman",
                table: "Institutions");

            migrationBuilder.DropColumn(
                name: "Type",
                schema: "eduman",
                table: "Institutions");
        }
    }
}
