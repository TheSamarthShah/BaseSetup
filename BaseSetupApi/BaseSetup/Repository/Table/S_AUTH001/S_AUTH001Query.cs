namespace BaseSetup.Repository.Table.S_AUTH001
{
	public static class S_AUTH001Query
	{
		public static string S_AUTH001_UPDATE_1()
		{
			return @"UPDATE SC_MAIN.S_AUTH001
                    SET     LASTACTIVITYTM = CURRENT_TIMESTAMP
                    WHERE   USERID = :Userid";
		}
	}
}
