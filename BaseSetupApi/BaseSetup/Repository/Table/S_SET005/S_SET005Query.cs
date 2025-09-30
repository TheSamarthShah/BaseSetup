namespace BaseSetup.Repository.Table.S_SET005
{
    public static class S_SET005Query
    {
        public static string S_SET005_DELETE_1()
        {
            return @"DELETE
                    FROM    SC_MAIN.S_SET005 S_SET005
                    WHERE   S_SET005.USERID = :Userid
                    AND     S_SET005.FORMID = :Formid";
        }
    }
}
