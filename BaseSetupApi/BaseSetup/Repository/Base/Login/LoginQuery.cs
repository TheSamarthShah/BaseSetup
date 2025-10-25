namespace BaseSetup.Repository.Base.Login
{
	public static class LoginQuery
	{
		#region S_AUTH001
		public static string S_AUTH001_SELECT_1()
		{
			return @"SELECT			S_AUTH001.USERNM USERNAME,
				                    S_AUTH001.CHARGECD
				                    --M_PROC005.CHARGENM
                    FROM	S_AUTH001
                    --LEFT JOIN		M_PROC005
                    --ON				S_AUTH001.CHARGECD	= M_PROC005.CHARGECD
                    WHERE			S_AUTH001.USERID	= :userid
                    AND				S_AUTH001.PASS		= :password";
		}

		public static string S_AUTH001_UPDATE_1()
		{
			return @"UPDATE S_AUTH001
                    SET     REFRESHTOKEN	= :refreshtoken
                    WHERE   USERID			= :userid";
		}
		#endregion S_AUTH001
	}
}
