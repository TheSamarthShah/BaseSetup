using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseSetup.Model;

[Table("sc_main.AppConfig")]  // match your PGSQL table
public partial class AppConfig
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; }

    // Map to jsonb column
    [Column("JsonData", TypeName = "jsonb")]
    public string JsonData { get; set; }
}
