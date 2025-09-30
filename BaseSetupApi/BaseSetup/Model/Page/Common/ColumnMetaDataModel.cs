namespace BaseSetup.Model.Page.Common
{
    public class ColumnMetaDataModel
    {
        public string TableName { get; set; } = string.Empty;
        public string ColumnName { get; set; } = string.Empty;
        public string DataType { get; set; } = string.Empty;
        public int? CharColDeclLength { get; set; }
        public int? DataPrecision { get; set; }
        public int? DataScale { get; set; }
    }

}
