using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SystemSupportDesk.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CorrecaoFKUsuarioPerfil : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_Perfis_PerfilId",
                table: "Usuarios");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_PerfilId",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "PerfilId",
                table: "Usuarios");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_IdPerfil",
                table: "Usuarios",
                column: "IdPerfil");

            migrationBuilder.AddForeignKey(
                name: "FK_Usuarios_Perfis_IdPerfil",
                table: "Usuarios",
                column: "IdPerfil",
                principalTable: "Perfis",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_Perfis_IdPerfil",
                table: "Usuarios");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_IdPerfil",
                table: "Usuarios");

            migrationBuilder.AddColumn<int>(
                name: "PerfilId",
                table: "Usuarios",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_PerfilId",
                table: "Usuarios",
                column: "PerfilId");

            migrationBuilder.AddForeignKey(
                name: "FK_Usuarios_Perfis_PerfilId",
                table: "Usuarios",
                column: "PerfilId",
                principalTable: "Perfis",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
