namespace BaseSetup.Model.Core
{
    /// <summary>
    /// Represents the details of a database table used for saving data operations (insert, update, delete).
    /// </summary>
    public class SaveData_TableDetail
    {
        public required string? TABLENAME { get; set; }

        // (table primary key, grid model property name)
        public List<(string, string)>? PRIMARYKEY { get; set; }

        // (table column name, grid model property name)
        public List<(string, string)>? UPDATECOLUMN { get; set; }

        // (table column name, grid model property name)
        public List<(string, string)>? INSERTCOLUMN { get; set; }

        // The SQL query will be used instead of dynamically generated query for inserting data in the table, if not defined will dynamically generated query will be used.
        public string? INSERTQUERY { get; set; }

        // (table primary key, grid model property name)
        public List<(string, string)>? INSERTQUERYPARAMS { get; set; }

        // The SQL query will be used instead of dynamically generated query for updating data in the table, if not defined will dynamically generated query will be used.
        public string? UPDATEQUERY { get; set; }

        // (table primary key, grid model property name)
        public List<(string, string)>? UPDATEQUERYPARAMS { get; set; }

        // The SQL query will be used instead of dynamically generated query for deleting data in the table, if not defined will dynamically generated query will be used.
        public string? DELETEQUERY { get; set; }

        // (key, grid model property name)
        public List<(string, string)>? DELETEQUERYPARAMS { get; set; }
    }
}
