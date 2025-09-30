using BaseSetup.Model.Common;
using static BaseSetup.Model.Common.BaseModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;


namespace BaseSetup.Model.Table
{
    [Table("sc_main.S_SET001")]
    public class S_SET001Model:BaseModel
    {
        [Key]
        public PropertyWrapper<string?> Conditionno { get; set; } = new();
        public PropertyWrapper<string?> Conditionnm { get; set; } = new();
        public PropertyWrapper<string?> formid { get; set; } = new();
        public PropertyWrapper<string?> userid { get; set; } = new();
        public PropertyWrapper<string?> accesskbn { get; set; } = new();
    }
}
