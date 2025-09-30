using Microsoft.EntityFrameworkCore;

namespace BaseSetup.Model
{
    public partial class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<AppConfig> AppConfigs { get; set; }

        public DbSet<TranslationConfig> TranslationConfigs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresExtension("uuid-ossp"); // optional, if you use extensions

            modelBuilder.Entity<AppConfig>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.ToTable("AppConfig", "sc_prod");

                entity.Property(e => e.Name)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(e => e.JsonData)
                    .HasColumnName("JsonData")
                    .HasColumnType("jsonb");
            });

            modelBuilder.Entity<TranslationConfig>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.ToTable("TranslationConfig", "sc_prod");

                entity.Property(e => e.Name)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(e => e.JsonData)
                    .HasColumnName("JsonData")
                    .HasColumnType("jsonb");
            });

            modelBuilder.HasDefaultSchema("sc_main");
            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}