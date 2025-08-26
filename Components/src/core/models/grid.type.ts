import { refScreenColumns } from "./refScreenColumns.type";

export type GRID = {
  name: string;
  tableName: string;
  displayName: string;
  dataType: string; //1: string, 2: number, 3: date, 4: kbn, 5: checkbox(boolean)
  isPositiveOnly?: boolean; //only for dataType = '2'
  visible: boolean;
  displaySeq?: number;
  primaryKey?: boolean;
  autogenerate?:boolean;
  gridIgnore?: boolean;
  isEditable?: boolean;
  frozen?: boolean;
  isRequired?: boolean;
  width: string;
  dateFormat?: string;
  isCenterAligned?: boolean;
  memberList?: Array<{
    code: string;
    name: string;
  }>;

  onChangeCallback?: (rowData: any) => void;

  searchVisible: boolean;
  searchRequired?: boolean;
  showMatchType?: boolean;
  isReferenceScreen: boolean;
  refTableName?: string ;
  refQueryID?: string ;
  refTableJPName?: string;
  refColumns?: Array<refScreenColumns>;
};

export type GRID_BTN = {
  label: string;
  splitbutton?: boolean;
  icon?: string;
  visible?: boolean;
  disabled?: boolean;
  severity: string;
  filled?: boolean;
  onBtnClick: () => void;
  menuModel?:any[];
}

// column-filter.model.ts
export type FilterCondition =
  | 'startsWith'
  | 'contains'
  | 'notContains'
  | 'endsWith'
  | 'equals'
  | 'notequals'
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