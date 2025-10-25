using BaseSetup.Model.Common;
using static BaseSetup.Model.Common.BaseModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BaseSetup.Model.Table
{
    [Table("S_SET003")]
    public class S_SET003Model : BaseModel
    {
        [Key]
        public PropertyWrapper<string?> Userid { get; set; } = new();
        [Key]
        public PropertyWrapper<string?> Formid { get; set; } = new();
        //1:move , 2:not move
        public PropertyWrapper<string?> Pnlheightkbn { get; set; } = new();
    }
}
