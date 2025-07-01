import { FILTER } from "./filter.type";
import { refScreenColumns } from "./refScreenColumns.type";

export type refScreenRequest = {
  TableName: string;
  QueryID: string;
  Columns: Array<refScreenColumns>;
  FilterValues: Array<FILTER>;
  Offset: number;
  Rows: number | null;
}