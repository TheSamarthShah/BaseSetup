import { refScreenColumns } from './refScreenColumns.type';

export type GRID = {
  dataField: string;
  tableName: string;
  caption: string;
  editorType: string; //1: string, 2: number, 3: date, 4: kbn, 5: checkbox(boolean)
  isPositiveNumberOnly?: boolean; //only for dataType = '2'
  IsVisible: boolean;
  isGridIgnore?: boolean;
  displayOrder?: number;
  isPrimaryKey?: boolean;
  isAutoGenerate?: boolean;
  isEditable?: boolean;
  isFrozen?: boolean;
  IsSortable?: boolean; 
  IsFilterable?: boolean;
  isRequired?: boolean;
  dateFormat?: string;
  tabGroup?: {
    tabCaption: string;
    colSpan: number;
  };
  alignment?: string;
  memberList?: Array<{
    code: string;
    caption: string;
  }>;

  onChangeCallback?: (rowData: any) => void;

  searchVisible: boolean;
  searchRequired?: boolean;
  showMatchType?: boolean;
  isReferenceScreen: boolean;
  refTableName?: string;
  queryID?: string;
  refTitleCaption : string;
  refTableJPName?: string;
  refColumns?: Array<refScreenColumns>;


  ColumnGroupNumber?: string;
  rowIndex?:string;
};


// column-filter.model.ts
export type FilterCondition =
  | 'startsWith'
  | 'contains'
  | 'notContains'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'lessThan'
  | 'greaterThan'
  | 'dateIs'
  | 'dateIsNot'
  | 'dateIsBefore'
  | 'dateIsAfter';
export type MatchMode = 'all' | 'any';

export interface ColumnFilterRule {
  condition: FilterCondition;
  value: string;
}

export interface ColumnFilterState {
  columnname: string;
  matchMode: MatchMode;
  rules: ColumnFilterRule[];
}

export type detailViewConfig = {
  tabCaption: string;
  tabColumns: number;
};

export type gridColumnHeaderMetaData = {
  dataField: string;
  caption: string;
  editorType: string; //1: string, 2: number, 3: date, 4: kbn , 5: dateTime
};
