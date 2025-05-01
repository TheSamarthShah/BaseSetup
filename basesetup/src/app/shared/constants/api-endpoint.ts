export const API_ENDPOINTS = {
  BASE: 'http://127.0.0.1:5000',
  LOGIN: '/login/login',
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
    LOG_ERROR:{
      LOG: '/common/logerror'
    },
    HIDE_FILTER: {
      GET: '/Common/gethidefilterdata',
      SAVE: '/Common/savehidefilterdata',
    },
    REFERENCE_SETTING: {
      SAVE: '/Common/savereferencesetting',
      GET: '/Common/getreferencesetting',
    },
  },
  MITEM0010U: {
    GET: '/mitem0010u/getdata',
    Export: '/mitem0010u/Exportdata',
    Save: '/mitem0010u/savedata',
  },
  M0010I: {
    GET: '/m0010i/getdata',
  },
  MITEM0011U: {
    GET: '/mitem0011u/getdata',
    AddData : '/mitem0011u/adddata',
    EditData : '/mitem0011u/editdata',
    DeleteData : '/mitem0011u/deletedata',
  },
};
