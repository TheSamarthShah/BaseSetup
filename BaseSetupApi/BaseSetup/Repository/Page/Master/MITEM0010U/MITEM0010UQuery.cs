namespace BaseSetup.Repository.Page.Master.MITEM0010U
{
	public static class MITEM0010UQuery
	{
		#region FW Region

		public static string SELECT_SQL_1()
		{
			return @"SELECT     MITEM0010.ITEMCD,
                                MITEM0010.PRODUCTCD,
                                MPROD0010.PRODUCTNM,
                                MITEM0010.PRODUCTNO,
                                MITEM0010.HMNM,
                                MITEM0010.HMRNM,
                                MITEM0010.WEBITEMCD,
                                MITEM0010.JANCD,
                                MITEM0010.ITEMTYP,
                                MITEM0010.VALSTARTYMD,
                                MITEM0010.REFITEMCD,
                                MITEM0010.ORGITEMCD,
                                MITEM0010.PRICEITEMCD,
                                MITEM0010.UPDTDT,
                                MITEM0010.ISACTIVE
                     FROM       M_ITEM0010_TEST MITEM0010
                     LEFT JOIN  M_PROD0010_TEST MPROD0010
                     ON         (MITEM0010.PRODUCTCD    = MPROD0010.PRODUCTCD) 
                     ORDER BY   MITEM0010.ITEMCD";
		}

		#endregion FW Region

		#region Custom Region
		#endregion Custom Region
	}
}
