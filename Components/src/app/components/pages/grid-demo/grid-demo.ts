import { Component, ViewChild } from '@angular/core';
import { Grid } from "../../../../core/components/grid/grid";
import { GRID } from '../../../../core/models/grid.type';
import { MITEM0010U } from '../../../../core/shared/jp-text';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'grid-demo',
  imports: [Grid, MatButtonModule],
  templateUrl: './grid-demo.html',
  styleUrl: './grid-demo.scss'
})
export class GridDemo {
  @ViewChild(Grid) gridComponent!: Grid;
  
  userId: string = 'SS';//JSON.parse(this.cookieService.get('user') ?? '').userid;
  //Form ID
  formId: string = 'Demo';
  formName: string = 'Demo';
  //This URL is used to fetch the data
  getDataUrl: string = 'https://192.168.80.217/testwebapi/mitem0010u/getdata';
//variable for all the texts stored in constants
  textContent: any = MITEM0010U;
  //options for ITEMTYP
  ITEMTYP_options: {
    code: string;
    name: string;
  }[] = [
    { code: '1', name: this.textContent.ITEMTYP_OPTIONS[0] },
    { code: '2', name: this.textContent.ITEMTYP_OPTIONS[1] },
    { code: '3', name: this.textContent.ITEMTYP_OPTIONS[2] },
    { code: '4', name: this.textContent.ITEMTYP_OPTIONS[3] },
    { code: '5', name: this.textContent.ITEMTYP_OPTIONS[4] },
    { code: '9', name: this.textContent.ITEMTYP_OPTIONS[5] },
  ];
  dataGrid: GRID[] = [
    {
      name: 'Itemcd',
      tableName: 'M_ITEM0010_TEST',
      displayName: this.textContent.ITEMCD,
      dataType: '1',
      visible: true,
      isRequired: false,
      gridIgnore: false,
      isEditable: false,
      autogenerate: true,
      primaryKey: true,
      displaySeq: 1,
      frozen: false,
      width: '',
      searchVisible: true,
      searchRequired: false,
      isReferenceScreen: true,
      refTableName: 'M_ITEM001_TEST',
      refTableJPName: this.textContent.ITEMCD,
      refColumns: [
        {
          name: 'HMNO',
          displayName: this.textContent.ITEMCD,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: 'Itemcd',
          orderBySeq: 1,
        },
        {
          name: 'HMNM',
          displayName: this.textContent.HMNM,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
        },
      ],
    },
    {
      name: 'Productcd',
      tableName: 'M_ITEM0010_TEST',
      displayName: this.textContent.PRODUCTCD,
      dataType: '1',
      visible: true,
      gridIgnore: false,
      isEditable: true,
      primaryKey: false,
      displaySeq: 2,
      frozen: false,
      isRequired: true,
      width: '',
      searchVisible: true,
      isReferenceScreen: true,
      refTableName: 'M_PROD0010_TEST',
      refTableJPName: this.textContent.PRODUCTCD,
      refColumns: [
        {
          name: 'PRODUCTCD',
          displayName: this.textContent.PRODUCTCD,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: 'Productcd',
          orderBySeq: 1,
        },
        {
          name: 'PRODUCTNM',
          displayName: this.textContent.PRODUCTNM,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: 'Productnm',
        },
        {
          name: 'PRODUCTENM',
          displayName: this.textContent.PRODUCTENM,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
        },
      ],
    },
    {
      name: 'Productnm',
      displayName: '製品名',
      dataType: '1',
      searchVisible: true,
      tableName: 'M_ITEM0010_TEST',
      isEditable: false,
      visible: true,
      frozen: false,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Productno',
      displayName: '製品品番',
      dataType: '1',
      searchVisible: true,
      tableName: 'M_ITEM0010_TEST',
      isEditable: true,
      visible: true,
      frozen: false,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Hmnm',
      displayName: '品目名称',
      dataType: '1',
      searchVisible: true,
      tableName: 'M_ITEM0010_TEST',
      isEditable: true,
      visible: true,
      frozen: false,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Hmrnm',
      displayName: '品目略称',
      dataType: '1',
      searchVisible: true,
      tableName: 'M_ITEM0010_TEST',
      isEditable: true,
      visible: true,
      frozen: false,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Webitemcd',
      displayName: 'ＷＥＢ品番',
      dataType: '1',
      searchVisible: true,
      tableName: 'M_ITEM0010_TEST',
      isEditable: true,
      visible: true,
      frozen: false,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Jancd',
      displayName: 'ＪＡＮコード',
      dataType: '2',
      searchVisible: true,
      tableName: 'M_ITEM0010_TEST',
      isEditable: true,
      visible: true,
      frozen: false,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Itemtyp',
      displayName: '品番種類',
      dataType: '4',
      searchVisible: true,
      memberList: this.ITEMTYP_options,
      tableName: 'M_ITEM0010_TEST',
      isEditable: true,
      visible: true,
      frozen: false,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Valstartymd',
      displayName: '有効開始日',
      dataType: '3',
      searchVisible: true,
      tableName: 'M_ITEM0010_TEST',
      isEditable: true,
      visible: true,
      frozen: false,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Updtdt',
      displayName: '',
      dataType: '3',
      searchVisible: false,
      tableName: 'M_ITEM0010_TEST',
      isEditable: false,
      visible: false,
      frozen: false,
      width: '',
      isReferenceScreen: false,
      gridIgnore: true,
    },
  ];


  getData() {
    if (this.gridComponent) {
      this.gridComponent.getData();
    }
  }
}
