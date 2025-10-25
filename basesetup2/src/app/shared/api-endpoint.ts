export const API_ENDPOINTS = {
  BASE: 'http://127.0.0.1:5000',
  LOGIN: '/login/login',
  GETREFRESHEDJWTTOKEN: '/common/getrefreshedjwttoken',
  CORE: {
    REFERENCE: {
      GET: '/common/getreferencescreendata',
    },
    COLUMNMETADATA: {
      GET: '/common/getcolumnmetadata',
    },
    CONDITION_SETTING: {
      GET_1: '/common/getconditiondisplaysettinglist',
      GET_2: '/common/getconditiondisplaysetting',
      GET_3: '/common/getlastconditionsetting',
      SAVE_1: '/common/saveconditiondisplaysetting',
      SAVE_2: '/common/updatelastconditionno',
      DELETE: '/common/deleteconditiondisplaysetting',
    },
    AUTO_ADJUSTMENT: {
      GET: '/Common/getheightadjustmentdata',
      SAVE: '/Common/saveheightadjustmentdata',
    },
    SORT_DATA: {
      SAVE: '/Common/savesortingdata',
      GET: '/Common/getsortingdata',
    },
    SWAP_COLUMN_DATA: {
      GET: '/Common/getswapcolumndata',
      SAVE: '/Common/swapColumnData',
    },
    LOG_ERROR: {
      LOG: '/common/logerror',
    },
    HIDE_FILTER: {
      GET: '/Common/gethidefilterdata',
      SAVE: '/Common/savehidefilterdata',
    },
    REFERENCE_SETTING: {
      SAVE: '/Common/savereferencesetting',
      GET: '/Common/getreferencesetting',
    },
    FILEUPLOADDOWNLOAD: {
      PHYSICALPATH: 'C:\\WEB_FW_Upload_Files',
      FILEDATAGET: '/common/filedataget',
      FILEUPLOAD: '/common/fileupload',
      FILEDELETE: '/common/filedelete',
      FILEDOWNLOAD: '/common/filedownload',
    },
  },
  MITEM0010U: {
    GET: '/mitem0010u/getdata',
    EXPORT: '/mitem0010u/Exportdata',
    SAVE: '/mitem0010u/savedata',
  },
  MITEM0011U: {
    GET: '/mitem0011u/getdata',
    ADD : '/mitem0011u/adddata',
    EDIT : '/mitem0011u/editdata',
    DELETE : '/mitem0011u/deletedata',
  },
  A0015U: {
    GET: '/a0015u/getdata',
    ADD: '/a0015u/adddata',
    EDIT: '/a0015u/editdata',
    DELETE: '/a0015u/deletedata',
  },
  A103: {
    GET: '/a103/getdata',
    EXPORT: '/a103/Exportdata',
    SAVE: '/a103/savedata',
  },
  A104: {
    GET: '/a104/getdata',
    EXPORT: '/a104/Exportdata',
    SAVE: '/a104/savedata',
  },
  A105: {
    GET: '/a105/getdata',
    EXPORT: '/a105/Exportdata',
    SAVE: '/a105/savedata',
  },
  C105: {
    GET: '/c105/getData',
    SAVE: '/c105/saveData',
    EXPORT: '/c105/exportData'
  },
  D101: {
    GET: '/SagyoKakunin/getData',
    EXPORT: '/SagyoKakunin/exportData',
  },
  D103: {
    GET_HEADERDATA: '/SagyoSansho/getHeaderData',
    GET_DETAILDATA: '/SagyoSansho/getDetailData',
  },
  D104: {
   GET: '/D104/getData',
   EXPORT: '/D104/exportData',
   PREVIEW: '/D104/previewData'
  },
  D201: {
    GET_PLANDATA: '/Seizojisshi/getDataPlanData',
    GET_HEADERDATA: '/Seizojisshi/getDataHeader',
    GET_SOPDATA: '/Seizojisshi/getDataSop',
    GET_CHECKLISTDATA: '/Seizojisshi/getDataChecklist',
    GET_CHECKLISTIMAGEDATA: '/Seizojisshi/getDataChecklistImg',
    GET_MEASUREMENTDATA: '/Seizojisshi/getDataMeasurement',
    SAVE_CHECKLISTDATA: '/Seizojisshi/saveDataChecklist',
    SAVE_STATUSDATA: '/Seizojisshi/saveDataStatus',
    SAVE_MEASUREMENTDATA: '/Seizojisshi/saveDataMeasurement',
    GET_MEASUREMENTIMAGEDATA: '/Seizojisshi/getDataMeasurementImg',
    GET_INPUTITEMDATA: '/Seizojisshi/getDataInputItem',
    GET_RESULTREFERENCE: '/Seizojisshi/getDataResultReference',
    GET_RESULTSIYOREFERENCE: '/Seizojisshi/getDataResultSiyoReference',
    SAVE_INPUTITEMDATA : '/Seizojisshi/saveDataInputItem',
    GET_RESULTREFERENCEALL: '/Seizojisshi/getDataResultReferenceAll',
    SAVE_RESULTREFERENCE: '/Seizojisshi/saveDataResult',
  },
  D204: {
    GET: '/D204/getData',
    EXPORT: '/D204/exportData',
    PREVIEW: '/D204/previewData'
  },
  D205: {
    GET_PLANDATA: '/D205/getDataPlanData',
    GET_HEADERDATA: '/D205/getDataHeader',
  },
  C101: {
    GET: '/C101/getData',
    UPDATE: '/C101/updateShiji',
    EXPORT: '/C101/exportData',
    CHECK_MITEM004: '/C101/checkMitem004'
  },
  C110: {
   GET: '/C110/getData',
   EXPORT: '/C110/exportData',
   PREVIEW: '/C110/previewData'
  },
  b110:{
    PROCEDURE_CALL : '/B110/MPSExecution'
  },
  F101: {
    GET: '/F101/getData',
  },
};
