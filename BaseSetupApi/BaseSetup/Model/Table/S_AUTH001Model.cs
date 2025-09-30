using BaseSetup.Model.Common;
using static BaseSetup.Model.Common.BaseModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BaseSetup.Model.Table
{
    [Table("sc_main.S_AUTH001")]
    public class S_AUTH001Model : BaseModel
    {
        [Key]
        public PropertyWrapper<string?> Userid { get; set; } = new();
        public PropertyWrapper<string?> Usernm { get; set; } = new();
        public PropertyWrapper<string?> Pass { get; set; } = new();
        public PropertyWrapper<DateTimeOffset?> Pswupdtdt { get; set; } = new();
        public PropertyWrapper<string?> Chargecd { get; set; } = new();
        public PropertyWrapper<string?> Refreshtoken { get; set; } = new();
        public PropertyWrapper<DateTimeOffset?> Lastactivitytm { get; set; } = new();
        public PropertyWrapper<string?> Instid { get; set; } = new();
        public PropertyWrapper<DateTimeOffset?> Instdt { get; set; } = new();
        public PropertyWrapper<string?> Instterm { get; set; } = new();
        public PropertyWrapper<string?> Instprgnm { get; set; } = new();
        public PropertyWrapper<string?> Updtid { get; set; } = new();
        public PropertyWrapper<DateTimeOffset?> Updtdt { get; set; } = new();
        public PropertyWrapper<string?> Updtterm { get; set; } = new();
        public PropertyWrapper<string?> Updtprgnm { get; set; } = new();
    }
}
