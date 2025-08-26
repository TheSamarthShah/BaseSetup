import { refScreenColumns } from "./refScreenColumns.type";

export type FILTER = {
  name: string;
  displayName: string;
  visible: boolean;
  required: boolean;
  value_from: string | string[];
  value_to: string;
  match_type: string;
  showMatchType?: boolean;
  data_type: string; //1: string, 2: number, 3: date, 4: checkbox, 6: radiobtn
  colMetadataKey: {
    tableName: string;
    columnName: string;
  };
  memberList?: Array<{
    code: string;
    name: string;
  }>;
  dateFormat?: string;
  invalidInput?: boolean;
  isReferenceScreen: boolean;
  refTableName?: string;
  refQueryID?: string;
  refTableJPName?: string;
  refColumns?: Array<refScreenColumns>;
};

export type MetadataKey = {
  tableName: string;
  columnName: string;
};
