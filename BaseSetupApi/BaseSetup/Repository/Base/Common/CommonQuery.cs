namespace BaseSetup.Repository.Base.Common
{
	public static class CommonQuery
	{
		#region S_SET001
		public static string S_SET001_SELECT_1()
		{
			return $"""
                    SELECT S_SET001.CONDITIONNO,
                           S_SET001.CONDITIONNM,
                           S_SET001.USERID,
                           S_SET001.FORMID,
                           S_AUTH001.USERNM,
                           S_SET001.ACCESSKBN
                    FROM sc_main.S_SET001 S_SET001
                    INNER JOIN  sc_main.S_AUTH001 S_AUTH001
                    ON      S_AUTH001.USERID = S_SET001.USERID
                    WHERE ((S_SET001.ACCESSKBN = '1' AND S_SET001.USERID = @LOGINUSERID)
                           OR (S_SET001.ACCESSKBN = '2' AND (S_SET001.USERID = @LOGINUSERID OR S_SET001.USERID LIKE @USERNM || '%')))
                    ORDER BY S_SET001.CONDITIONNO
                """;
		}

		public static string S_SET001_INSERT_1()
		{
			return @" INSERT INTO sc_main.S_SET001 (CONDITIONNO, CONDITIONNM, FORMID, USERID, ACCESSKBN)
					VALUES (:CONDITIONNO, :CONDITIONNM, :FORMID, :USERID, :ACCESSKBN);";
		}

		public static string S_SET001_UPDATE_1()
		{
			return @"UPDATE sc_main.S_SET001
					SET CONDITIONNM = :CONDITIONNM,
						ACCESSKBN = :ACCESSKBN
					WHERE CONDITIONNO = :CONDITIONNO;";
		}

        public static string S_SET001_DELETE_1()
        {
            return @"DELETE FROM sc_main.S_SET001
                        WHERE CONDITIONNO = :CONDITIONNO;  ";
        }
        #endregion S_SET001

        #region S_SET002
        public static string S_SET002_SELECT_1()
		{
			return @"SELECT S_SET002.CONDITIONNO,
                            S_SET002.COLUMNNAME,
                            S_SET002.VISIBLE,
                            S_SET002.FROMVALUE,
                            S_SET002.TOVALUE,
                            S_SET002.COMBOVALUE,
                            S_SET002.CHECKVALUE
                    FROM    sc_main.S_SET002 S_SET002
                    ORDER BY S_SET002.SEQ";
		}

		public static string S_SET002_INSERT_1()
		{
			return @"INSERT INTO sc_main.S_SET002 (CONDITIONNO, COLUMNNAME, SEQ, VISIBLE, FROMVALUE, TOVALUE, COMBOVALUE, CHECKVALUE)
			VALUES (:CONDITIONNO, :COLUMNNAME, :SEQ, :VISIBLE, :FROMVALUE, :TOVALUE, :COMBOVALUE, :CHECKVALUE);";
		}

		public static string S_SET002_UPDATE_1()
		{
			return @"UPDATE sc_main.S_SET002
					SET VISIBLE = :VISIBLE,
						FROMVALUE = :FROMVALUE,
						TOVALUE = :TOVALUE,
						COMBOVALUE = :COMBOVALUE,
						CHECKVALUE = :CHECKVALUE
					WHERE CONDITIONNO = :CONDITIONNO
					  AND COLUMNNAME = :COLUMNNAME;";
		}
        #endregion S_SET002

        public static string S_SET002_DELETE_1()
        {
            return @"DELETE FROM sc_main.S_SET002
                    WHERE CONDITIONNO = :CONDITIONNO; ";
        }



        #region S_SET003
        public static string S_SET003_SELECT_1()
		{
			return @"SELECT	S_SET003.USERID,
		                    S_SET003.FORMID,
		                    S_SET003.PNLHEIGHTKBN
                    FROM	sc_main.S_SET003 S_SET003";
		}
        #endregion S_SET003

        #region TMES_COL_SIZE_INFO
        public static string TMES_COL_SIZE_INFO_SELECT_1()
		{
			return @" SELECT TABLE_NAME as TableName,
                             COLUMN_NAME as ColumnName,
                             DATA_TYPE as DataType,
                             CHAR_COL_DECL_LENGTH as CharColDeclLength,
                             DATA_PRECISION as DataPrecision,
                             DATA_SCALE as DataScale
                      FROM   sc_main.col_size_info";
        }
        #endregion TMES_COL_SIZE_INFO

        #region S_SET004
        public static string S_SET004_SELECT_1()
		{
			return @"SELECT S_SET004.USERID,
                            S_SET004.FORMID,
                            S_SET004.SORTCOLUMN1,
                            S_SET004.SORTCOLUMN2,
                            S_SET004.SORTCOLUMN3,
                            S_SET004.SORTCOLUMN4,
                            S_SET004.SORTCOLUMN5,
                            S_SET004.ASC1,
                            S_SET004.ASC2,
                            S_SET004.ASC3,
                            S_SET004.ASC4,
                            S_SET004.ASC5
              FROM    sc_main.S_SET004 AS S_SET004";
        }
		#endregion S_SET004

		#region S_SET005
		public static string S_SET005_SELECT_1()
		{
			return @"SELECT S_SET005.USERID,
                            S_SET005.FORMID,
                            S_SET005.COLNO,
                            S_SET005.DISPCOLNO,
                            S_SET005.VISIBLE,
                            S_SET005.FROZEN,
                            S_SET005.COLNM
                     FROM   SC_MAIN.S_SET005 S_SET005
                     ORDER BY DISPCOLNO";
		}
		#endregion S_SET005

		#region S_SET006
		public static string S_SET006_SELECT_1()
		{
			return @"SELECT S_SET006.LAST_CONDITIONNO,
                            S_SET006.USERID,
                            S_SET006.FORMID
                    FROM    sc_main.S_SET006";
		}
		public static string S_SET006_SELECT_2()
		{
			return @"SELECT     S_SET002.COLUMNNAME,
                                S_SET002.VISIBLE,
                                S_SET002.FROMVALUE,
                                S_SET002.TOVALUE,
                                S_SET002.COMBOVALUE,
                                S_SET002.CHECKVALUE,
                                S_SET006.FORMID,
                                S_SET006.USERID
                    FROM        sc_main.S_SET006 S_SET006
                    INNER JOIN  sc_main.S_SET002 S_SET002
                    ON          S_SET006.LAST_CONDITIONNO = S_SET002.CONDITIONNO
                    ORDER BY    S_SET002.SEQ";
		}
		#endregion

		#region S_SET007
		public static string S_SET007_SELECT_1()
		{
			return @"SELECT S_SET007.HIDEFILTERKBN,
                            S_SET007.USERID,
                            S_SET007.FORMID
                    FROM    sc_main.S_SET007 S_SET007";
		}
		#endregion

		#region S_SET008
		public static string S_SET008_SELECT_1()
		{
			return @"SELECT S_SET008.INITIALSEARCHKBN,
                            S_SET008.USERID,
                            S_SET008.FORMID,
                            S_SET008.TABLENAME
                     FROM   S_SET008 S_SET008";
		}
        #endregion S_SET008

        #region S_AUTH001
        public static string S_AUTH001_SELECT_1()
        {
            return @"SELECT 1
                    FROM   sc_main.s_auth001 s_auth001
                    WHERE  s_auth001.userid = @userid
                    AND    s_auth001.refreshtoken = @refreshtoken
                    AND    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - s_auth001.lastactivitytm)) / 60 < @idletimemins";
        }
        #endregion S_AUTH001
        public static string S_004INsert()
        {
            return @"
                        INSERT INTO sc_main.S_SET004
                        (
                            USERID,
                            FORMID,
                            SORTCOLUMN1,
                            SORTCOLUMN2,
                            SORTCOLUMN3,
                            SORTCOLUMN4,
                            SORTCOLUMN5,
                            ASC1,
                            ASC2,
                            ASC3,
                            ASC4,
                            ASC5
                        )
                        VALUES
                        (
                            :UserId,
                            :FormId,
                            :SortColumn1,
                            :SortColumn2,
                            :SortColumn3,
                            :SortColumn4,
                            :SortColumn5,
                            :Asc1,
                            :Asc2,
                            :Asc3,
                            :Asc4,
                            :Asc5
                        );

                    ";
        }
    }
}
