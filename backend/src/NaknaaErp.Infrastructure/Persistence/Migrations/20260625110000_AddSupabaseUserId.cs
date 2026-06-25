using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NaknaaErp.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSupabaseUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SupabaseUserId",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_SupabaseUserId",
                table: "users",
                column: "SupabaseUserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_SupabaseUserId",
                table: "users");

            migrationBuilder.DropColumn(
                name: "SupabaseUserId",
                table: "users");
        }
    }
}
