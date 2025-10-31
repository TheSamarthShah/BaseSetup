export type refScreenColumns = {
  columnName: string;
  caption: string;
  editorType: string; //1: string, 2: number, 3: date, 4: kbn
  isVisible: boolean;
  isVisibleInSearch: boolean;
  memberList?: Array<{
    code: string;
    caption: string;
  }>;
  searchVisible: boolean;
  mainScreenColumnName?: string;
  defaultValueColumnName?: string;
  queryOrderBySeq?: number;
};
