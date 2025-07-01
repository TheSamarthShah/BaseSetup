import {
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  NgZone,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { COMMON, TOROKU, D201 } from '../../../shared/jp-text';
import { Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import {
  ERRMSG,
  WARNMSG,
  CONFIRMMSG,
  SUCCESSMSG,
} from '../../../shared/messages';
import { MessageService } from 'primeng/api';
import { GRID, GRID_BTN } from '../../../model/core/grid.type';
import { SplitterModule } from 'primeng/splitter';
import { CONFIG } from '../../../shared/config';
import { ActyCommonService } from '../../../services/shared/acty-common.service';
import { TabsModule } from 'primeng/tabs';
import { D201Service } from '../../../services/Seizou/d201.service';
import { CommonModule } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { UploadImagesComponent } from '../../core/upload-images/upload-images.component';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ReferenceScreenDialogComponent } from '../../core/reference-screen-dialog/reference-screen-dialog.component';
import { MaxLengthDirective } from '../../../directives/max-length.directive';
import { DatePickerModule } from 'primeng/datepicker';
import { TorokuGridComponent } from '../../core/toroku-grid/toroku-grid.component';
import { FileUploadDownloadService } from '../../../services/core/file-upload-download.service';
import { CookieService } from 'ngx-cookie-service';
import { SaveData } from '../../../model/core/saveData.type';
import { firstValueFrom, take } from 'rxjs';
import { StepperModule } from 'primeng/stepper';
import { StepsModule } from 'primeng/steps';
import { FloatLabel } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { refScreenColumns } from '../../../model/core/refScreenColumns.type';
import { FormStateService } from '../../../services/base/form-state.service';
import { ReferenceScreenButtonComponent } from '../../core/reference-screen-button/reference-screen-button.component';
import { ActyDialogService } from '../../../services/shared/acty-dialog.service';
import { DataChangeDetectedService } from '../../../services/core/data-change-detected.service';
import { changesReturn } from '../../../model/core/confirm-changes-guard-props.type';
import { confirmChangesGuardComponent } from '../../../model/shared/confirm-changes-guard-props.type';

@Component({
  selector: 'app-d201',
  imports: [
    ButtonModule,
    RippleModule,
    FormsModule,
    InputTextModule,
    SplitterModule,
    TabsModule,
    CommonModule,
    GalleriaModule,
    DialogModule,
    ToolbarModule,
    UploadImagesComponent,
    TableModule,
    CheckboxModule,
    TorokuGridComponent,
    MaxLengthDirective,
    InputGroup,
    InputGroupAddonModule,
    DatePickerModule,
    ReferenceScreenDialogComponent,
    StepperModule,
    StepsModule,
    TorokuGridComponent,
    FloatLabel,
    TextareaModule,
    ReferenceScreenButtonComponent,
    MessageModule,
  ],
  templateUrl: './d201.component.html',
  styleUrl: './d201.component.scss',
})
export class D201Component implements OnDestroy, confirmChangesGuardComponent {
  @ViewChild('galleria') galleria!: ElementRef;
  @ViewChild('inputItemDataList_grid')
  inputItemDataList_grid!: TorokuGridComponent;
  @ViewChild('resultTabDetailsGridComponent')
  resultTabDetailsGridComponent!: TorokuGridComponent;
  @ViewChild('ResultReferenceDefectiveItems')
  ResultReferenceDefectiveItems!: TorokuGridComponent;
  @ViewChild('ResultReferenceUsedItems')
  ResultReferenceUsedItems!: TorokuGridComponent;

  /*services*/
  route = inject(ActivatedRoute);
  titleService = inject(Title); // for setting title in browser tab
  //for displaying Toast messages
  messageService = inject(MessageService);
  formStateService = inject(FormStateService);
  ActyCommonService = inject(ActyCommonService);
  confirmDialog = inject(ActyDialogService);
  d201Service = inject(D201Service);
  fileService = inject(FileUploadDownloadService);
  cookieService = inject(CookieService);
  location = inject(Location);
  ngZone = inject(NgZone);
  DataChangeDetected = inject(DataChangeDetectedService);

  /* variables */
  // all form related texts stored in constants
  textContent: any = D201;
  JissekiTabLabel: string = '';
  processingEventsText: any = this.textContent.ProcessingEvents;
  activeTab: number = 0;
  Checklist_Data: {
    Planno: string;
    Proceseq: number;
    Seq: number;
    Measurerequiredkbn: string;
    Checkdetail: string;
    Measurementnm: string;
    Datakbn: string;
    Unitnm: string;
    Remark: string;
    Sortno: number;
    Measurecd: string;
    Unitcd: string;
    Chkflg: string;
    Measured: string;
    Workseq: number;
    Kbn: string;
    Chargecd: string;
    Chargenm: string;
    Images: { file: File; path: string }[];
    rowId: number;
    _error: string;
  }[] = [];

  ChecklistImage_Data: {
    Planno: string;
    Proceseq: number;
    Workseq: number;
    Kbn: string;
    Seq: number;
    Fileseq: number;
    Filenm: string;
  }[] = [];

  MeasurementImage_Data: {
    Planno: string;
    Proceseq: number;
    Workseq: number;
    Measuretimes: number;
    Seq: number;
    Fileseq: number;
    Physicalpath?: string;
    Filenm: string;
  }[] = [];

  Header_Data = {
    Hmno: '',
    Hmnm: '',
    Planqty: null,
    Needqty: null,
    Yieldqty: null,
    Chargecd: '',
    Chargenm: '',
    Planno: '',
    Proceseq: null,
    State: '',
    Procecd: '',
    Procenm: '',
    Workseq: null,
    Mfgstate: '',
    Chkflg: '',
    Shokouteiflg: '',
    Lastkouteiflg: '',
    Planstockqty: null,
    Updtdt_D_MFG001: null as string | null,
    Updtdt_D_PLAN101: null as string | null,
    Updtdt_D_PLAN102: null as string | null,
  };

  Instruction_Tab_Data = {
    Rescd: '',
    Resnm: '',
    Presetupstartdt: '',
    Prodstartdt: '',
    Prodenddt: '',
    Aftsetupenddt: '',
  };

  MeasurementDataMap: {
    [times: number]: {
      Planno: string;
      Proceseq: number;
      Seq: number;
      Measuretimes: number;
      Measurecd: string;
      Measurementnm: string;
      Datakbn: string;
      Unitcd: string;
      Unitnm: string;
      Remark: string;
      Sortno: number;
      Measured: string;
      Workseq: number;
      Chargecd: string;
      Chargenm: string;
      rowId: number;
      Images: { file: File; path: string }[];
      Updtdt: Date;
      isAlreadyRegistered: boolean;
      _error: string;
    }[];
  } = {};
  fileList: {
    file: File;
    fullPath: string;
    fileName: string;
    Planno: string;
    Proceseq: number;
    Workseq: number;
    Measuretimes: number;
    Seq: number;
    Fileseq: number;
  }[] = [];
  maxMeasuretimes: number = 0;
  InvalidMSG: any = {
    Chargecd_CheckList: '',
    Chargecd_Measurement: '',
  };

  activeMeasurementTime: number = 1;
  Sop_File_Paths: Array<string> = [];

  displayFiles: Array<{
    originalUrl: string;
    resizedUrl: string;
    thumbnailUrl: string;
  }> = [];

  selectedGalleriaIndex: number = 0;

  images: {
    itemImageSrc: string;
    thumbnailImageSrc: string;
    originalImageSrc: string;
  }[] = [];

  galleriaResponsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '960px',
      numVisible: 4,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];
  userId: string = JSON.parse(this.cookieService.get('user') ?? '').userid;
  userNm: string = JSON.parse(this.cookieService.get('user') ?? '').username;

  tantoshaId: string = JSON.parse(this.cookieService.get('user') ?? '')
    .chargecd;
  tantoshaNm: string = JSON.parse(this.cookieService.get('user') ?? '')
    .chargenm;

  fixedPath_CheckListImages: string =
    CONFIG.IMAGE_FIXED_PATHS.ChecklistFileFolderPath;
  inputItemDataListDataGrid: GRID[] = [
    {
      name: 'Labelno',
      tableName: 'D_MFG009',
      displayName: this.textContent.LABELNO,
      dataType: '1',
      visible: true,
      isRequired: true,
      isEditable: true,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: true,
      refTableName: 'D_STOCK003',
      refTableJPName: this.textContent.LABELNO,
      refQueryID: 'D201_InputItems_REF_1',
      refColumns: [
        {
          name: 'PLANNO',
          displayName: this.textContent.PLANNO,
          dataType: '1',
          visible: false,
          width: '',
          defaultValueColumn: 'Planno',
          searchVisible: true,
          mainScreenColumn: '',
          orderBySeq: 1,
        },
        {
          name: 'PROCESEQ',
          displayName: this.textContent.PROCESEQ,
          dataType: '2',
          visible: false,
          width: '',
          defaultValueColumn: 'Proceseq',
          searchVisible: true,
          mainScreenColumn: '',
          orderBySeq: 2,
        },
        {
          name: 'LABELNO',
          displayName: this.textContent.LABELNO,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: 'Labelno',
          orderBySeq: 3,
        },
        {
          name: 'HMNO',
          displayName: this.textContent.HMNO,
          dataType: '1',
          visible: true,
          width: 'Hmno',
          searchVisible: true,
          mainScreenColumn: 'Hmno',
          orderBySeq: 4,
        },
        {
          name: 'HMNM',
          displayName: this.textContent.HMNM,
          dataType: '1',
          visible: true,
          width: 'Hmnm',
          searchVisible: true,
          mainScreenColumn: 'Hmnm',
          orderBySeq: 5,
        },
        {
          name: 'STOCKCD',
          displayName: this.textContent.STOCKCD,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: '',
          orderBySeq: 6,
        },
        {
          name: 'SHELFNO',
          displayName: this.textContent.SHELFNO,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: '',
          orderBySeq: 7,
        },
        {
          name: 'LOTNO',
          displayName: this.textContent.LOTNO,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: 'Lotno',
          orderBySeq: 8,
        },
        {
          name: 'STOCKQTY',
          displayName: this.textContent.STOCKQTY,
          dataType: '2',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: 'Stockqty',
          orderBySeq: 10,
        },
        {
          name: 'UNIT',
          displayName: this.textContent.UNIT,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: '',
          orderBySeq: 11,
        },
        {
          name: 'UNITNM',
          displayName: this.textContent.UNITNM,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: 'Unitnm',
          orderBySeq: 11,
        },
        {
          name: 'LABELDTTM',
          displayName: this.textContent.LABELDTTM,
          dataType: '3',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: '',
          orderBySeq: 12,
        },
      ],
    },
    {
      name: 'Lotno',
      tableName: 'D_STOCK003',
      displayName: this.textContent.LOTNO,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Hmno',
      tableName: 'D_STOCK003',
      displayName: this.textContent.USE_HMNO,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Hmnm',
      tableName: 'M_ITEM001',
      displayName: this.textContent.USE_HMNM,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Stockqty',
      tableName: 'D_STOCK003',
      displayName: this.textContent.STOCKQTY,
      dataType: '2',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Unitnm',
      tableName: 'M_UNIT001',
      displayName: this.textContent.UNITNM,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
  ];
  fixedPath_MeasurementImages: string =
    CONFIG.IMAGE_FIXED_PATHS.MeasurementFileFolderPath;

  ResultReference_ManufacturingRecord: {
    ProcessingBtn: string;
    Workseq: number | null;
    Labelno: string;
    Goodqty: number | null;
    Badqty: number | null;
    Remark: string;
    Lotno: string;
    Chargecd: string;
    Chargenm: string;
    Updtdt_D_MFG002: string | null;
    Updtdt_D_STOCK003: string | null;
    errors: {
      [key: string]: string;
    };
  } = {
    ProcessingBtn: '',
    Workseq: null,
    Labelno: '',
    Goodqty: null,
    Badqty: null,
    Remark: '',
    Lotno: '',
    Chargecd: '',
    Chargenm: '',
    Updtdt_D_MFG002: null,
    Updtdt_D_STOCK003: null,
    errors: {},
  };

  oldResultReference_ManufacturingRecord: any = structuredClone(
    this.ResultReference_ManufacturingRecord
  );

  ResultReferenceDefectiveItemsGrid: GRID[] = [
    {
      name: 'Badqty',
      tableName: 'D_MFG004',
      displayName: this.textContent.BADQTY,
      dataType: '2',
      isPositiveOnly: true,
      visible: true,
      isEditable: true,
      isRequired: true,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Strseq',
      tableName: 'D_MFG004',
      displayName: '',
      dataType: '2',
      visible: false,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Reacd',
      tableName: 'D_MFG004',
      displayName: this.textContent.REACD,
      dataType: '1',
      visible: true,
      isEditable: true,
      isRequired: true,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: true,
      refTableName: 'M_PROC009',
      refTableJPName: this.textContent.REACD,
      refColumns: [
        {
          name: 'REACD',
          displayName: this.textContent.REACD,
          dataType: '1',
          visible: true,
          width: '',
          defaultValueColumn: 'Reacd',
          searchVisible: true,
          mainScreenColumn: 'Reacd',
          orderBySeq: 1,
        },
        {
          name: 'REANM',
          displayName: this.textContent.REANM,
          dataType: '1',
          visible: true,
          width: '',
          defaultValueColumn: 'Reanm',
          searchVisible: true,
          mainScreenColumn: 'Reanm',
          orderBySeq: 2,
        },
      ],
    },
    {
      name: 'Reanm',
      tableName: 'M_PROC009',
      displayName: this.textContent.REANM,
      dataType: '1',
      visible: true,
      isEditable: true,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Updtdt',
      tableName: '',
      displayName: '',
      dataType: '3',
      visible: false,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
      gridIgnore: true,
    },
  ];

  SetActualQtyOnChange(rowData: any): void {
    const goodQty = Number(this.ResultReference_ManufacturingRecord.Goodqty);
    const koQty = Number(rowData.Koqty);
    const oyaQty = Number(rowData.Oyaqty);

    if (!isNaN(goodQty) && !isNaN(koQty) && !isNaN(oyaQty) && oyaQty !== 0) {
      rowData.Actualqty = goodQty * (koQty / oyaQty);
    }
  }

  ResultReferenceUsedItemsGrid: GRID[] = [
    {
      name: 'Fullyconsumed',
      tableName: '',
      displayName: this.textContent.CURRENTITEM_FULLYCONSUMED,
      dataType: '5',
      visible: true,
      isEditable: true,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Labelno',
      tableName: 'D_MFG009',
      displayName: this.textContent.CURRENTITEM_LABELNO,
      dataType: '1',
      visible: true,
      isEditable: true,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: true,
      isRequired: true,
      refTableName: 'D_STOCK003',
      refTableJPName: this.textContent.LABELNO,
      refQueryID: 'D201_InputItems_REF_1',
      refColumns: [
        {
          name: 'PLANNO',
          displayName: this.textContent.PLANNO,
          dataType: '1',
          visible: false,
          width: '',
          defaultValueColumn: 'Planno',
          searchVisible: true,
          mainScreenColumn: '',
          orderBySeq: 1,
        },
        {
          name: 'PROCESEQ',
          displayName: this.textContent.PROCESEQ,
          dataType: '2',
          visible: false,
          width: '',
          defaultValueColumn: 'Proceseq',
          searchVisible: true,
          mainScreenColumn: '',
          orderBySeq: 2,
        },
        {
          name: 'LABELNO',
          displayName: this.textContent.LABELNO,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: 'Labelno',
          orderBySeq: 3,
        },
        {
          name: 'HMNO',
          displayName: this.textContent.HMNO,
          dataType: '1',
          visible: true,
          width: 'Hmno',
          searchVisible: true,
          mainScreenColumn: 'Hmno',
          orderBySeq: 4,
        },
        {
          name: 'HMNM',
          displayName: this.textContent.HMNM,
          dataType: '1',
          visible: true,
          width: 'Hmnm',
          searchVisible: true,
          mainScreenColumn: 'Hmnm',
          orderBySeq: 5,
        },
        {
          name: 'STOCKCD',
          displayName: this.textContent.STOCKCD,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: 'Stockcd',
          orderBySeq: 6,
        },
        {
          name: 'SHELFNO',
          displayName: this.textContent.SHELFNO,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: '',
          orderBySeq: 7,
        },
        {
          name: 'LOTNO',
          displayName: this.textContent.LOTNO,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: 'Lotno',
          orderBySeq: 8,
        },
        {
          name: 'STOCKQTY',
          displayName: this.textContent.STOCKQTY,
          dataType: '2',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: 'Stockqty',
          orderBySeq: 10,
        },
        {
          name: 'UNIT',
          displayName: this.textContent.UNIT,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: '',
          orderBySeq: 11,
        },
        {
          name: 'UNITNM',
          displayName: this.textContent.UNIT,
          dataType: '1',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: 'Unitnm',
          orderBySeq: 11,
        },
        {
          name: 'LABELDTTM',
          displayName: this.textContent.LABELDTTM,
          dataType: '3',
          visible: true,
          width: '',
          searchVisible: true,
          mainScreenColumn: '',
          orderBySeq: 12,
        },
        {
          name: 'OYAQTY',
          displayName: '',
          dataType: '1',
          visible: false,
          width: '',
          searchVisible: false,
          mainScreenColumn: 'Oyaqty',
          orderBySeq: 13,
        },
        {
          name: 'KOQTY',
          displayName: '',
          dataType: '1',
          visible: false,
          width: '',
          searchVisible: false,
          mainScreenColumn: 'Koqty',
          orderBySeq: 14,
        },
        {
          name: 'UPDTDT',
          displayName: '',
          dataType: '3',
          visible: false,
          width: '',
          searchVisible: false,
          mainScreenColumn: 'Updtdt_D_STOCK003',
          orderBySeq: 14,
        },
      ],
      onChangeCallback: (rowData: any): void => {
        this.SetActualQtyOnChange(rowData);
      },
    },
    {
      name: 'Lotno',
      tableName: 'D_STOCK003',
      displayName: this.textContent.LOTNO,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Hmno',
      tableName: 'D_STOCK003',
      displayName: this.textContent.USE_HMNO,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Hmnm',
      tableName: 'M_ITEM001',
      displayName: this.textContent.USE_HMNM,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Stockqty',
      tableName: 'D_STOCK003',
      displayName: this.textContent.STOCKQTY,
      dataType: '2',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Unitnm',
      tableName: 'M_UNIT001',
      displayName: this.textContent.UNITNM,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Actualqty',
      tableName: 'D_MFG003',
      displayName: this.textContent.ACTUALQTY,
      dataType: '2',
      isPositiveOnly: true,
      visible: true,
      isEditable: true,
      width: 'auto',
      searchVisible: false,
      isRequired: true,
      isReferenceScreen: false,
    },
    {
      name: 'Strseq',
      tableName: 'D_MFG003',
      displayName: '',
      dataType: '2',
      visible: false,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Oyaqty',
      tableName: 'M_ITEM002',
      displayName: '',
      dataType: '2',
      visible: false,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Koqty',
      tableName: 'M_ITEM002',
      displayName: '',
      dataType: '2',
      visible: false,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Stockcd',
      tableName: 'D_STOCK003',
      displayName: '',
      dataType: '1',
      visible: false,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Updtdt_D_MFG003',
      tableName: '',
      displayName: '',
      dataType: '3',
      visible: false,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
      gridIgnore: true,
    },
    {
      name: 'Updtdt_D_STOCK003',
      tableName: '',
      displayName: '',
      dataType: '3',
      visible: false,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
      gridIgnore: true,
    },
  ];

  //options for WORKKBN
  WORKKBN_options: {
    code: string;
    name: string;
  }[] = [
    { code: '1', name: this.textContent.WORKKBN_OPTIONS[0] },
    { code: '2', name: this.textContent.WORKKBN_OPTIONS[1] },
    { code: '3', name: this.textContent.WORKKBN_OPTIONS[2] },
    { code: '4', name: this.textContent.WORKKBN_OPTIONS[3] },
    { code: '5', name: this.textContent.WORKKBN_OPTIONS[4] },
  ];

  ResultTabDetailsGrid: GRID[] = [
    {
      name: 'Workkbn',
      tableName: 'D_MFG001',
      displayName: this.textContent.WORKKBN,
      dataType: '4',
      visible: true,
      isEditable: false,
      memberList: this.WORKKBN_options,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Workstartdt',
      tableName: 'D_MFG001',
      displayName: this.textContent.WORKSTARTDT,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Workstarttm',
      tableName: 'D_MFG001',
      displayName: this.textContent.WORKSTARTTM,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Workenddt',
      tableName: 'D_MFG001',
      displayName: this.textContent.WORKENDDT,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Workendtm',
      tableName: 'D_MFG001',
      displayName: this.textContent.WORKENDTM,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Worktime',
      tableName: 'D_MFG001',
      displayName: this.textContent.WORKTIME,
      dataType: '2',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Goodqty',
      tableName: 'D_MFG002',
      displayName: this.textContent.GOODQTY,
      dataType: '2',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Badqty',
      tableName: 'D_MFG002',
      displayName: this.textContent.BADQTY,
      dataType: '2',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Chargenm',
      tableName: 'M_PROC005',
      displayName: this.textContent.OPERATOR_LBL,
      dataType: '1',
      visible: true,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
    {
      name: 'Workseq',
      tableName: 'D_MFG001',
      displayName: this.textContent.WORKSEQ,
      dataType: '2',
      visible: false,
      isEditable: false,
      width: 'auto',
      searchVisible: false,
      isReferenceScreen: false,
    },
  ];

  //Reference Screen Torokusha table name
  Torokusha_refTableName: string = 'M_PROC005';
  //Reference Screen Torokusha table jp name
  Torokusha_refTableJPName: string = '';
  // Itemcd's Reference Screen columns detail
  Torokusha_refColumns: refScreenColumns[] = [
    {
      name: 'CHARGECD',
      displayName: this.textContent.CHARGECD,
      dataType: '1',
      visible: true,
      width: 'auto',
      searchVisible: true,
      mainScreenColumn: 'Chargecd',
      orderBySeq: 1,
    },
    {
      name: 'CHARGENM',
      displayName: this.textContent.CHARGENM,
      dataType: '1',
      visible: true,
      width: 'auto',
      mainScreenColumn: 'Chargenm',
      searchVisible: true,
    },
  ];
  resultTabTotalDataList: { [key: string]: any } = {
    Totaltimepre: '',
    Totaltimerun: '',
    Totaltimepost: '',
    Totaltimebreak: '',
    Totaltimepause: '',
    Totaltimeall: '',
    Sumgoodqty: '',
    Sumbadqty: '',
  };
  transsionValue: { [key: string]: any } = {};
  showSopData: boolean = false;
  showChecklistData: boolean = false;
  showMeasurementData: boolean = false;

  /* signals */
  isShowHeader = signal<boolean>(true);
  currPkData = signal<{ [key: string]: any } | null>(null);
  //splitter sizes
  splitterSizes = signal<number[]>(CONFIG.D201.SPITTERSIZES);
  //splitter min sizes
  splitterMinSizes = signal<number[]>(CONFIG.D201.SPITTERMINSIZES);
  dataInputItemDataList = signal<Array<any>>([]);
  ResultReferenceDefectiveItemsGridList = signal<Array<any>>([]);
  ResultReferenceUsedItemsGridList = signal<Array<any>>([]);
  resultTabDetailsDataList = signal<Array<any>>([]);
  ResultTabDetailsGridExtraBtns = (): GRID_BTN[] => [
    {
      label: this.textContent.RESULT_TAB_GRID_EXTRA_BTN,
      severity: 'secondary',
      onBtnClick: () => this.onEditResultReference(),
      disabled: this.isEditResultDataButtonEnabled(),
      icon: 'pi pi-pencil',
    },
  ];
  defaultValue = signal<{ [key: string]: any }>({});
  /**
   * used to fetch reference data without opening the reference screen
   * it is passed as input for reference button
   */
  refScreenOnRowData = signal<{
    tableName: string;
    queryID: string;
    columns: refScreenColumns[];
    rowId: number;
    refForColumn: string;
    selectedValue: string;
    defaultValue: { [key: string]: any };
  }>({
    tableName: '',
    queryID: '',
    columns: [],
    rowId: -1,
    refForColumn: '',
    selectedValue: '',
    defaultValue: {},
  });
  hasAlreadyFetchedSiyoData: boolean = false;

  constructor() {
    this.splitterSizes.set(this.getSplitterSizeOnWidth());
    // React to title changes
    effect(() => {
      const pkData = this.currPkData();
      const firstPkValue = pkData ? Object.values(pkData)[0] : '';
      const parts = [this.textContent.FORM_TITLE];

      if (firstPkValue) {
        parts.push(firstPkValue);
      }

      this.titleService.setTitle(
        parts.join(' ' + COMMON.TITLE_JOIN_PIPE + ' ')
      );
    });

    // if url has the key(which will contain the mode and pkData) then use it and setup accordingly
    this.route.queryParams.subscribe(async (params) => {
      const key = params['key'];
      if (key) {
        try {
          const decoded = atob(key); // e.g., "Planno=123&Proceseq=2"

          const keyValues = new URLSearchParams(decoded);
          const pkData: { [key: string]: string } = {};
          keyValues.forEach((value, key) => {
            pkData[key] = value;
          });
          this.currPkData.set(pkData);
          this.defaultValue.set(pkData);
          // if pk data is not null then get data and set it else set initial data
          if (pkData !== null) {
            await this.getHeaderData();
            await this.getPlanData();
            this.getSopData();
          } else {
          }
        } catch (e) {
          this.messageService.add({
            severity: 'error',
            summary: ERRMSG.E0005,
            sticky: true,
          });
        }
      } else {
        // if no key in url then switch to new mode
      }
    });
  }

  ngOnDestroy(): void {
    this.formStateService.torokuModoruFormId.set('');
  }

  //製造実績照会 this tab 修正ボタン button enable disable related
  isEditResultDataButtonEnabled(): boolean {
    return this.resultTabDetailsGridComponent?.selectedData?.Workkbn !== '2';
  }

  //According to screen size set the splitter height
  getSplitterSizeOnWidth(): [number, number] {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 630) return [55, 45];
    if (screenWidth <= 700) return [40, 60];
    if (screenWidth <= 1500) return [30, 70];
    return [25, 75];
  }

  //called when splitter is moved and updates the grid and filter div scroll height
  onSplitterMoved(event: any): void {
    this.splitterSizes.set([
      Math.round(event.sizes[0]),
      Math.round(event.sizes[1]),
    ]);

    const currentTopPanelSize = this.splitterSizes()[0];
    const minTopPanelSize = this.splitterMinSizes()[0];
    if (currentTopPanelSize > minTopPanelSize) {
      this.isShowHeader.set(true);
    } else {
      this.isShowHeader.set(false);
    }
  }

  //called when splitter is toggled
  splitterToggle(event: boolean): void {
    let sizes: number[] = [];

    if (event) {
      sizes = CONFIG.D201.SPITTERSIZES;
    } else {
      sizes = this.ActyCommonService.getSplitterToggleSizesWithoutButtons();
    }
    this.isShowHeader.set(event);
    this.splitterSizes.set(sizes);
  }

  onTabChange(event: any): void {
    this.activeTab = event;
    if (event === 0) {
    }
    if (event === 1) {
    } else if (event === 2) {
    } else if (event === 3) {
    } else if (event === 4) {
    } else if (event === 5) {
    } else if (event === 6) {
    }
  }

  //when resize the window then update the scroll height for grid and filter
  @HostListener('window:resize')
  onResize(): void {
    if (this.isShowHeader()) {
      this.splitterSizes.set(this.getSplitterSizeOnWidth());
    }
  }

  async getPlanData(): Promise<void> {
    const data = this.currPkData();
    if (data && data['Planno'] && data['Proceseq'] != null) {
      this.d201Service
        .GetDataPlanData(data['Planno'], data['Proceseq'])
        .subscribe({
          next: (res) => {
            if (res?.Code === 200) {
              const planData = res.Data.Record;
              this.Instruction_Tab_Data = {
                Rescd: planData.Rescd || '',
                Resnm: planData.Resnm || '',
                Presetupstartdt: planData.Presetupstartdt || '',
                Prodstartdt: planData.Prodstartdt || '',
                Prodenddt: planData.Prodenddt || '',
                Aftsetupenddt: planData.Aftsetupenddt || '',
              };
            }
          },
          error: (err) => {},
        });
    }
  }

  setActiveStatusColor(code: string) {
    const el = document.querySelector('.d201') as HTMLElement;
    if (!el) return;

    const statusVar = `--status-color-${code}`;
    const computedColor = getComputedStyle(el)
      .getPropertyValue(statusVar)
      .trim();

    el.style.setProperty('--active-status-color', computedColor);
  }

  async getHeaderData(): Promise<void> {
    const data = this.currPkData();
    if (data && data['Planno'] && data['Proceseq'] != null) {
      return new Promise<void>((resolve, reject) => {
        this.d201Service
          .GetDataHeader(data['Planno'], data['Proceseq'])
          .subscribe({
            next: (res) => {
              if (res?.Code === 200) {
                const headerData = res.Data.Record;
                this.Header_Data = {
                  Hmno: headerData.Hmno ?? '',
                  Hmnm: headerData.Hmnm ?? '',
                  Planqty: headerData.Planqty ?? null,
                  Needqty: headerData.Needqty ?? null,
                  Yieldqty: headerData.Yieldqty ?? null,
                  Chargecd: headerData.Chargecd
                    ? headerData.Chargecd
                    : this.tantoshaId,
                  Chargenm: headerData.Chargecd
                    ? headerData.Chargenm
                    : this.tantoshaNm,
                  Planno: headerData.Planno ?? '',
                  Proceseq: headerData.Proceseq ?? null,
                  State: headerData.State ?? '',
                  Procecd: headerData.Procecd ?? '',
                  Procenm: headerData.Procenm ?? '',
                  Workseq: headerData.Workseq ?? null,
                  Mfgstate: headerData.Mfgstate ?? '',
                  Chkflg: headerData.Chkflg ?? '',
                  Shokouteiflg: headerData.Shokouteiflg ?? '',
                  Lastkouteiflg: headerData.Lastkouteiflg ?? '',
                  Planstockqty: headerData.Planstockqty ?? null,
                  Updtdt_D_MFG001: headerData.Updtdt_D_MFG001
                    ? this.ActyCommonService.getUtcIsoDate(
                        headerData.Updtdt_D_MFG001,
                        true
                      ) || ''
                    : null,

                  Updtdt_D_PLAN101: headerData.Updtdt_D_PLAN101
                    ? this.ActyCommonService.getUtcIsoDate(
                        headerData.Updtdt_D_PLAN101,
                        true
                      ) || ''
                    : null,

                  Updtdt_D_PLAN102: headerData.Updtdt_D_PLAN102
                    ? this.ActyCommonService.getUtcIsoDate(
                        headerData.Updtdt_D_PLAN102,
                        true
                      ) || ''
                    : null,
                };

                this.setActiveStatusColor(this.Header_Data.State);

                // get checklist and measurement everytime with header as workkbn is to be updated
                this.getChecklistData();
                this.getMeasurementData();

                this.getInputItemDataListData();
                this.getDataResultReferenceAll();
              }
              resolve();
            },
            error: (err) => {
              reject(err);
            },
          });
      });
    } else {
      return Promise.resolve(); // if no data, resolve immediately
    }
  }

  async getSopData(): Promise<void> {
    if (this.Header_Data?.Proceseq != null && this.Header_Data?.Hmno) {
      return new Promise<void>((resolve, reject) => {
        this.d201Service
          .GetDataSop(this.Header_Data.Hmno, Number(this.Header_Data.Proceseq))
          .subscribe({
            next: (res) => {
              if (res?.Code === 200) {
                this.Sop_File_Paths = res.Data.Records.map(
                  (r: any) =>
                    CONFIG.IMAGE_FIXED_PATHS.SopFileFolderPath + r.Filepath
                );
                if (this.Sop_File_Paths.length > 0) {
                  this.showSopData = true;
                }
                this.getSopImages();
              }
              resolve();
            },
            error: (err) => {
              reject(err);
            },
          });
      });
    } else {
      return Promise.resolve();
    }
  }

  async getSopImages(): Promise<void> {
    if (this.Sop_File_Paths.length !== 0) {
      const blobs = await this.fileService.prepareBlobsFromServer(
        this.Sop_File_Paths
      );

      this.displayFiles = [];

      for (const blob of blobs) {
        const images = await this.fileService.processImage(
          blob,
          700,
          400,
          100,
          50
        );
        this.displayFiles.push(images);
      }

      this.images = this.displayFiles.map((file) => ({
        originalImageSrc: file.originalUrl,
        itemImageSrc: file.resizedUrl,
        thumbnailImageSrc: file.thumbnailUrl,
      }));
    }
  }

  async getChecklistData(): Promise<void> {
    const data = this.currPkData();
    if (data && data['Planno'] && data['Proceseq'] != null) {
      return new Promise<void>((resolve, reject) => {
        this.d201Service
          .GetDataChecklist(data['Planno'], data['Proceseq'])
          .subscribe({
            next: (res) => {
              if (res?.Code === 200) {
                const checkList = res.Data.Records;
                let rowId = 0;
                this.Checklist_Data = checkList.map((item: any) => ({
                  Planno: item.Planno ?? '',
                  Proceseq: item.Proceseq ?? null,
                  Seq: item.Seq,
                  Measurerequiredkbn: item.Measurerequiredkbn ?? '',
                  Checkdetail: item.Checkdetail ?? '',
                  Measurementnm: item.Measurementnm ?? '',
                  Datakbn: item.Datakbn,
                  Unitnm: item.Unitnm ?? '',
                  Remark: item.Remark ?? '',
                  Sortno: item.Sortno ?? null,
                  Measurecd: item.Measurecd ?? '',
                  Unitcd: item.Unitcd ?? '',
                  Chkflg: item.Chkflg ?? '',
                  Measured:
                    item.Datakbn === '3' && item.Measured
                      ? new Date(item.Measured)
                      : item.Measured ?? '',
                  Workseq: item.Workseq,
                  Kbn: item.Kbn ?? '',
                  Chargecd:
                    this.Header_Data.Chkflg === '0'
                      ? this.tantoshaId
                      : item.Chargecd ?? '',
                  Chargenm:
                    this.Header_Data.Chkflg === '0'
                      ? this.tantoshaNm
                      : item.Chargenm ?? '',
                  rowId: rowId++,
                  _error: '',
                }));
                if (this.Checklist_Data.length > 0) {
                  this.showChecklistData = true;
                }
                if (this.Header_Data.Chkflg === '1') {
                  this.getChecklistImageData();
                }
              }
              resolve();
            },
            error: (err) => {
              reject(err);
            },
          });
      });
    } else {
      return Promise.resolve();
    }
  }

  async getMeasurementData(): Promise<void> {
    const data = this.currPkData();
    if (data && data['Planno'] && data['Proceseq'] != null) {
      return new Promise<void>((resolve, reject) => {
        this.d201Service
          .GetDataMeasurement(data['Planno'], data['Proceseq'])
          .subscribe({
            next: (res) => {
              if (res?.Code === 200) {
                const MeasurementData = res.Data.Records;
                if (MeasurementData.length > 0) {
                  this.showMeasurementData = true;
                  this.MeasurementDataMap = {};
                  this.maxMeasuretimes = Math.max(
                    ...MeasurementData.map((r: any) => r.Measuretimes ?? 0)
                  );

                  for (let time = 1; time <= this.maxMeasuretimes; time++) {
                    let rowId = 0;
                    this.MeasurementDataMap[time] = MeasurementData.filter(
                      (item: any) => item.Measuretimes === time
                    ).map((item: any) => ({
                      Planno: item.Planno ?? '',
                      Proceseq: item.Proceseq ?? null,
                      Seq: item.Seq ?? null,
                      Measuretimes: item.Measuretimes ?? 1,
                      CurrentMeasureIndex: time,
                      Measurecd: item.Measurecd ?? '',
                      Measurementnm: item.Measurementnm ?? '',
                      Datakbn: item.Datakbn ?? '0',
                      Unitcd: item.Unitcd ?? '',
                      Unitnm: item.Unitnm ?? '',
                      Remark: item.Remark ?? '',
                      Sortno: item.Sortno ?? null,
                      Measured:
                        item.Datakbn === '3' && item.Measured
                          ? new Date(item.Measured)
                          : item.Measured ?? '',
                      Workseq: item.Workseq ?? Number(this.Header_Data.Workseq),
                      Chargecd: item.Workseq ? item.Chargecd : this.tantoshaId,
                      Chargenm: item.Workseq ? item.Chargenm : this.tantoshaNm,
                      rowId: rowId++,
                      Images: item.Images ?? [],
                      Checkdetail: item.Checkdetail ?? '',
                      Updtdt: item.Updtdt
                        ? this.ActyCommonService.getUtcIsoDate(
                            item.Updtdt,
                            true
                          )
                        : null,
                      isAlreadyRegistered: item.Workseq ? true : false,
                      _error: '',
                    }));
                  }

                  this.getMeasurementImageData();
                }
              }
              resolve();
            },
            error: (err) => {
              reject(err);
            },
          });
      });
    } else {
      return Promise.resolve();
    }
  }

  async getInputItemDataListData(): Promise<void> {
    const data = this.currPkData();
    if (data && data['Planno'] && data['Proceseq'] != null) {
      this.d201Service
        .InputItemDataList(data['Planno'], data['Proceseq'])
        .subscribe({
          next: (res) => {
            if (res?.Code === 200) {
              const inputItemDataList = res.Data?.Records ?? [];
              this.dataInputItemDataList.set(inputItemDataList);
            }
          },
          error: (err) => {},
        });
    }
  }

  async getResultReferenceData(): Promise<void> {
    let planno = '';
    let proceseq = null;
    let workseq = null;
    if (
      this.transsionValue['ProcessingBtn'] ===
      this.textContent.ProcessingBtn.EDIT_MODE
    ) {
      planno = this.transsionValue['Planno'];
      proceseq = this.transsionValue['Proceseq'];
      workseq = this.transsionValue['Workseq'];
    } else {
      planno = this.Header_Data?.Planno;
      proceseq = this.Header_Data?.Proceseq ?? null;
      workseq = this.Header_Data?.Workseq ?? null;
    }
    if (planno != '' && proceseq != null && workseq != null) {
      return new Promise<void>((resolve, reject) => {
        this.d201Service
          .GetDataResultReference(planno, proceseq, workseq)
          .subscribe({
            next: (res) => {
              if (res?.Code === 200) {
                const record = res?.Data?.Record;
                this.ResultReference_ManufacturingRecord = {
                  Workseq: record?.Manufacturingrecord?.Workseq ?? null,
                  Labelno: record?.Manufacturingrecord?.Labelno ?? '',
                  Goodqty: record?.Manufacturingrecord?.Goodqty ?? null,
                  Badqty: null,
                  Remark: record?.Manufacturingrecord?.Remark ?? '',
                  Lotno: record?.Manufacturingrecord?.Lotno ?? '',
                  Chargecd: record?.Manufacturingrecord?.Chargecd ?? '',
                  Chargenm: record?.Manufacturingrecord?.Chargenm ?? '',
                  ProcessingBtn: '',
                  Updtdt_D_MFG002: record?.Manufacturingrecord?.Updtdt_D_MFG002
                    ? this.ActyCommonService.getUtcIsoDate(
                        record.Manufacturingrecord.Updtdt_D_MFG002,
                        true
                      ) || ''
                    : null,

                  Updtdt_D_STOCK003: record?.Manufacturingrecord
                    ?.Updtdt_D_STOCK003
                    ? this.ActyCommonService.getUtcIsoDate(
                        record.Manufacturingrecord.Updtdt_D_STOCK003,
                        true
                      ) || ''
                    : null,
                  errors: {},
                };
                this.oldResultReference_ManufacturingRecord = structuredClone(
                  this.ResultReference_ManufacturingRecord
                );

                this.ResultReferenceDefectiveItemsGridList.set(
                  (record?.Defectiveitems ?? []).map((d: any) => ({
                    Strseq: d.Strseq ?? null,
                    Badqty: d.Badqty ?? null,
                    Reacd: d.Reacd ?? '',
                    Reanm: d.Reanm ?? '',
                    Updtdt: d.Updtdt ?? null,
                  }))
                );

                this.ResultReferenceUsedItemsGridList.set(
                  (record?.Useditems ?? []).map((u: any) => ({
                    Fullyconsumed: false,
                    Labelno: u.Labelno ?? '',
                    Lotno: u.Lotno ?? '',
                    Hmno: u.Hmno ?? '',
                    Hmnm: u.Hmnm ?? '',
                    Stockqty: u.Stockqty ?? null,
                    Unitnm: u.Unitnm ?? '',
                    Actualqty: u.Actualqty ?? null,
                    Oyaqty: u.Oyaqty ?? null,
                    Koqty: u.Koqty ?? null,
                    Strseq: u.Strseq ?? null,
                    Stockcd: u.Stockcd ?? null,
                    Updtdt_D_MFG003: u.Updtdt_D_MFG003 ?? null,
                    Updtdt_D_STOCK003: u.Updtdt_D_STOCK003 ?? null,
                  }))
                );
              }
              resolve();
            },
            error: (err) => {
              reject(err);
            },
          });
      });
    } else {
      return Promise.resolve(); // if no data, resolve immediately
    }
  }

  async getResultSiyoReferenceData(): Promise<void> {
    const planno = this.Header_Data?.Planno;
    const proceseq = this.Header_Data?.Proceseq;
    const goodqty = this.ResultReference_ManufacturingRecord.Goodqty;
    if (planno != '' && proceseq != null && goodqty != null) {
      return new Promise<void>((resolve, reject) => {
        this.d201Service
          .GetDataResultSiyoReference(planno, proceseq, goodqty)
          .subscribe({
            next: (res) => {
              if (res?.Code === 200) {
                const Records = res?.Data?.Records;
                this.ResultReferenceUsedItemsGridList.set(
                  (Records ?? []).map((u: any) => ({
                    Fullyconsumed: false,
                    Labelno: u.Labelno ?? '',
                    Lotno: u.Lotno ?? '',
                    Hmno: u.Hmno ?? '',
                    Hmnm: u.Hmnm ?? '',
                    Stockqty: u.Stockqty ?? null,
                    Unitnm: u.Unitnm ?? '',
                    Actualqty: u.Actualqty ?? null,
                    Oyaqty: u.Oyaqty ?? null,
                    Koqty: u.Koqty ?? null,
                    Stockcd: u.Stockcd ?? null,
                    Strseq: null,
                    Updtdt_D_MFG003: u.Updtdt_D_MFG003 ?? null,
                    Updtdt_D_STOCK003: u.Updtdt_D_STOCK003 ?? null,
                  }))
                );

                this.ResultReference_ManufacturingRecord.Lotno =
                  this.Header_Data.Planno + this.Header_Data.Workseq;
                this.ResultReference_ManufacturingRecord.Chargecd =
                  this.tantoshaId;
                this.ResultReference_ManufacturingRecord.Chargenm =
                  this.tantoshaNm;
                this.ValidateManufacturingField('Chargecd');
                this.ValidateManufacturingField('Lotno');
              }
              resolve();
            },
            error: (err) => {
              reject(err);
            },
          });
      });
    } else {
      return Promise.resolve(); // if no data, resolve immediately
    }
  }

  async getDataResultReferenceAll(): Promise<void> {
    const planno = this.Header_Data?.Planno;
    const proceseq = this.Header_Data?.Proceseq;
    if (planno != '' && proceseq != null) {
      return new Promise<void>((resolve, reject) => {
        this.d201Service.GetDataReferenceResultAll(planno, proceseq).subscribe({
          next: (res) => {
            if (res?.Code === 200) {
              this.resultTabTotalDataList = res.Data.Record.TotalRecord;
              this.resultTabDetailsDataList.set(
                res.Data.Record.GridRecord ?? []
              );
            }
            resolve();
          },
          error: (err) => {
            reject(err);
          },
        });
      });
    } else {
      return Promise.resolve(); // if no data, resolve immediately
    }
  }

  onEditResultReference(): void {
    const Planno = this.resultTabDetailsGridComponent.selectedData.Planno;
    const Proceseq = this.resultTabDetailsGridComponent.selectedData.Proceseq;
    const Workseq = this.resultTabDetailsGridComponent.selectedData.Workseq;
    this.transsionValue = {
      Planno: Planno,
      Proceseq: Proceseq,
      Workseq: Workseq,
      ProcessingBtn: this.textContent.ProcessingBtn.EDIT_MODE,
      LastActiveTab: Number(this.activeTab),
    };
    this.MoveToJissekiTab();
  }

  async RegisterInputItemDataList(): Promise<void> {
    const data = this.currPkData();
    let dataInputItemDataListInsert: any = {
      AddList: [],
      UpdateList: [],
      DeleteList: [],
      Formid: this.textContent.FORM_ID,
      Userid: this.userId,
      Programnm: this.textContent.FORM_TITLE,
    };

    const dataList = this.inputItemDataList_grid.visibleDataList();
    //同じ現品ラベル番号がある
    const labelNoList: string[] = dataList.map((item: any) => item.Labelno);
    const hasDuplicates = new Set(labelNoList).size !== labelNoList.length;
    if (hasDuplicates) {
      this.messageService.add({
        severity: 'warn',
        summary: WARNMSG.W0006,
        sticky: true,
      });
      return;
    }

    if (this.inputItemDataList_grid) {
      dataInputItemDataListInsert =
        await this.inputItemDataList_grid.getSaveData();
    }

    if (data) {
      dataInputItemDataListInsert.AddList =
        dataInputItemDataListInsert.AddList.map((item: any) => ({
          Planno: data['Planno'],
          Proceseq: data['Proceseq'],
          Labelno: item.Labelno,
          Stockqty: item.Stockqty,
          Pickdttm: null,
          Chargecd: this.Header_Data.Chargecd || this.tantoshaId,
        }));
    }

    dataInputItemDataListInsert.Formid = this.textContent.FORM_ID;
    dataInputItemDataListInsert.Userid = this.userId;
    dataInputItemDataListInsert.Programnm = this.textContent.FORM_TITLE;

    if (dataInputItemDataListInsert.AddList.length === 0) return;
    this.d201Service
      .AddInputItemDataList(dataInputItemDataListInsert)
      .subscribe({
        next: (res) => {
          if (res.Code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: SUCCESSMSG.S0001,
            });
            //grid data refresh
            this.getInputItemDataListData();
          }
        },
      });
  }

  getStateLabel(state: string): string {
    const key = `STATE_${state.toUpperCase()}`;
    return this.textContent[key] ?? this.textContent['STATE'];
  }

  openBlobImageInNewTab(blobUrl: string) {
    const zoomableHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Image Preview</title>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          background: transparent;
          overflow: hidden;
        }
        .container {
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          touch-action: none;
        }
        img {
          max-width: none;
          transform-origin: center;
          cursor: grab;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="${blobUrl}" id="image" />
      </div>
      <script>
        const img = document.getElementById('image');
        let scale = 1;
        let translateX = 0, translateY = 0;
        let isDragging = false;
        let lastX = 0, lastY = 0;

        img.addEventListener('wheel', e => {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          scale = Math.min(Math.max(0.1, scale + delta), 5);
          updateTransform();
        });

        img.addEventListener('pointerdown', e => {
          e.preventDefault();
          isDragging = true;
          lastX = e.clientX;
          lastY = e.clientY;
          img.setPointerCapture(e.pointerId);
          img.style.cursor = 'grabbing';
        });

        img.addEventListener('pointermove', e => {
          if (!isDragging) return;
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          translateX += dx;
          translateY += dy;
          lastX = e.clientX;
          lastY = e.clientY;
          updateTransform();
        });

        img.addEventListener('pointerup', e => {
          isDragging = false;
          img.releasePointerCapture(e.pointerId);
          img.style.cursor = 'grab';
        });

        function updateTransform() {
          img.style.transform = \`translate(\${translateX}px, \${translateY}px) scale(\${scale})\`;
        }
      </script>
    </body>
    </html>
  `;

    const blob = new Blob([zoomableHtml], { type: 'text/html' });
    const htmlUrl = URL.createObjectURL(blob);
    window.open(htmlUrl, '_blank');
  }

  showButton(btnId: string): boolean {
    let hasPreSetup: boolean =
      this.ActyCommonService.getUtcIsoDate(
        this.Instruction_Tab_Data.Presetupstartdt,
        true
      ) !=
      this.ActyCommonService.getUtcIsoDate(
        this.Instruction_Tab_Data.Prodstartdt,
        true
      );
    let state: string = this.Header_Data.State;
    let hasChecklistData: boolean = this.Checklist_Data.length > 0;
    let isChecklistDone: boolean = this.Header_Data.Chkflg === '1';

    switch (btnId) {
      case 'start_setup_btn':
        if (state === '1' && hasPreSetup) {
          return true;
        }
        return false;
      case 'start_production_btn':
        if (state === '1' && !hasPreSetup) {
          return true;
        }
        if (state === '2' && !hasChecklistData) {
          return true;
        }
        if (state === '2' && hasChecklistData && isChecklistDone) {
          return true;
        }
        return false;
      case 'end_production_btn':
        if (state === '5') {
          return true;
        }
        return false;
      case 'end_post_setup_btn':
        if (state === '9') {
          return true;
        }
        return false;
      case 'production_handover_btn':
        if (state === '5') {
          return true;
        }
        return false;
      case 'handover_complete_btn':
        if (state === '8') {
          return true;
        }
        return false;
      case 'interrupt_btn':
        if (state === '2') {
          return true;
        }
        if (state === '5') {
          return true;
        }
        return false;
      case 'resume_btn':
        if (state === '3' || state === '6') {
          return true;
        }
        return false;
      case 'start_break_btn':
        if (state === '2' || state === '5' || state === '9') {
          return true;
        }
        return false;
      case 'end_break_btn':
        if (state === '4' || state === '7' || state === 'A') {
          return true;
        }
        return false;
      case 'cancel_btn':
        if (state === '2' || state === '5') {
          return true;
        }
        return false;
      case 'back_to_list_btn':
        return true;

      default:
        return false;
    }
  }

  async opsButtonClick(actionId: string): Promise<void> {
    let state: string = this.Header_Data.State;
    let hasSopData: boolean = this.Sop_File_Paths.length > 0; //SOP
    let hasCheckListData: boolean = this.Checklist_Data.length > 0; //チェックリストマスタ
    let hasMnfgInputData: boolean = Object.values(this.MeasurementDataMap).some(
      (arr) => arr.length > 0
    ); //製造データ収集
    let hasItemsInUseInputData: boolean = true; //使用指示 //TODO

    switch (actionId) {
      case 'start_setup_btn':
        const result5 = await this.confirmDialog.show({
          message: CONFIRMMSG.C0010,
          buttons: [
            {
              label: TOROKU.NO,
            },
            {
              label: TOROKU.YES,
              severity: 'primary',
            },
          ],
        });
        if (result5 === 0) {
          return;
        }

        if (state === '1') {
          let result: boolean = await this.UpdateStatus(
            this.processingEventsText.START_PRE_SETUP
          );
          if (result) {
            if (hasSopData) {
              this.activeTab = 1;
            } else if (hasCheckListData) {
              this.activeTab = 2;
            } else if (hasMnfgInputData) {
              this.activeTab = 3;
            } else if (hasItemsInUseInputData) {
              this.activeTab = 4;
            } else {
            }
          }
        }
        break;
      case 'start_production_btn':
        const result6 = await this.confirmDialog.show({
          message: CONFIRMMSG.C0011,
          buttons: [
            {
              label: TOROKU.NO,
            },
            {
              label: TOROKU.YES,
              severity: 'primary',
            },
          ],
        });
        if (result6 === 0) {
          return;
        }

        if (state === '2') {
          await this.UpdateStatus(this.processingEventsText.START_PRODUCTION);
          if (hasMnfgInputData) {
            this.activeTab = 3;
          } else if (hasItemsInUseInputData) {
            this.activeTab = 4;
          } else {
          }
        } else if (state === '1') {
          await this.UpdateStatus(this.processingEventsText.START_PRODUCTION);
          if (hasMnfgInputData) {
            this.activeTab = 3;
          } else if (hasItemsInUseInputData) {
            this.activeTab = 4;
          } else {
          }
        }
        break;
      case 'end_production_btn':
        if (state === '5') {
          this.transsionValue['ProcessingBtn'] =
            this.textContent.ProcessingBtn.END_PRODUCTION_BTN;
          this.transsionValue['LastActiveTab'] = Number(this.activeTab); // write number for by val
          this.MoveToJissekiTab(); //実績登録→製造実績照会
        }
        break;
      case 'end_post_setup_btn':
        const result8 = await this.confirmDialog.show({
          message: CONFIRMMSG.C0013,
          buttons: [
            {
              label: TOROKU.NO,
            },
            {
              label: TOROKU.YES,
              severity: 'primary',
            },
          ],
        });
        if (result8 === 0) {
          return;
        }

        if (state === '9') {
          await this.UpdateStatus(this.processingEventsText.END_POST_PROCESS);
        }
        break;
      case 'production_handover_btn':
        if (state === '5') {
          this.transsionValue['LastActiveTab'] = Number(this.activeTab); // write number for by val
          this.transsionValue['ProcessingBtn'] =
            this.textContent.ProcessingBtn.PRODUCTION_HANDOVER_BTN;
          this.MoveToJissekiTab(); //実績登録→作業指示確認
        }
        break;
      case 'handover_complete_btn':
        const result7 = await this.confirmDialog.show({
          message: CONFIRMMSG.C0012,
          buttons: [
            {
              label: TOROKU.NO,
            },
            {
              label: TOROKU.YES,
              severity: 'primary',
            },
          ],
        });
        if (result7 === 0) {
          return;
        }

        if (state === '8') {
          await this.UpdateStatus(
            this.processingEventsText.RESUME_AFTER_HANDOVER
          );
        }
        break;
      case 'interrupt_btn':
        //生産指示工順情報.状態<>5:製造中
        if (state !== '5') {
          const result = await this.confirmDialog.show({
            message: CONFIRMMSG.C0006,
            buttons: [
              {
                label: TOROKU.NO,
              },
              {
                label: TOROKU.YES,
                severity: 'primary',
              },
            ],
          });
          if (result === 0) {
            return;
          }
        }
        if (state === '2') {
          await this.UpdateStatus(
            this.processingEventsText.INTERRUPT_PRODUCTION
          );
        } else if (state === '5') {
          this.transsionValue['LastActiveTab'] = Number(this.activeTab); // write number for by val
          this.transsionValue['ProcessingBtn'] =
            this.textContent.ProcessingBtn.INTERRUPT_BTN;
          this.MoveToJissekiTab(); //実績登録→製造実績照会
        }
        break;
      case 'resume_btn':
        const result2 = await this.confirmDialog.show({
          message: CONFIRMMSG.C0007,
          buttons: [
            {
              label: TOROKU.NO,
            },
            {
              label: TOROKU.YES,
              severity: 'primary',
            },
          ],
        });
        if (result2 === 0) {
          return;
        }

        if (state === '3' || state === '6') {
          this.UpdateStatus(this.processingEventsText.RESUME_FROM_INTERRUPT);
        }
        break;
      case 'start_break_btn':
        if (state !== '5') {
          const result3 = await this.confirmDialog.show({
            message: CONFIRMMSG.C0008,
            buttons: [
              {
                label: TOROKU.NO,
              },
              {
                label: TOROKU.YES,
                severity: 'primary',
              },
            ],
          });
          if (result3 === 0) {
            return;
          }
        }
        if (state === '2' || state === '9') {
          this.UpdateStatus(this.processingEventsText.START_BREAK);
        } else if (state === '5') {
          this.transsionValue['ProcessingBtn'] =
            this.textContent.ProcessingBtn.START_BREAK_BTN;
          this.transsionValue['LastActiveTab'] = Number(this.activeTab); // write number for by val
          this.MoveToJissekiTab(); //実績登録→製造実績照会
        }
        break;
      case 'end_break_btn':
        const result4 = await this.confirmDialog.show({
          message: CONFIRMMSG.C0009,
          buttons: [
            {
              label: TOROKU.NO,
            },
            {
              label: TOROKU.YES,
              severity: 'primary',
            },
          ],
        });
        if (result4 === 0) {
          return;
        }

        if (state === '4' || state === '7' || state === 'A') {
          this.UpdateStatus(this.processingEventsText.RETURN_FROM_BREAK);
        }
        break;
      case 'cancel_btn':
        const result9 = await this.confirmDialog.show({
          message: CONFIRMMSG.C0014,
          buttons: [
            {
              label: TOROKU.NO,
            },
            {
              label: TOROKU.YES,
              severity: 'primary',
            },
          ],
        });
        if (result9 === 0) {
          return;
        }

        if (state === '2' || state === '5') {
          await this.UpdateStatus(this.processingEventsText.CANCEL_START);
          this.activeTab = 0;
        }
        break;
      case 'back_to_list_btn': {
        if (this.formStateService.torokuModoruFormId() != '') {
          this.formStateService.torokuModoru.set(true);
        }
        this.location.back();
        break;
      }
      default:
    }
  }

  isTabEnabled(tabIdx: number): boolean {
    let hasPreSetup: boolean =
      this.ActyCommonService.getUtcIsoDate(
        this.Instruction_Tab_Data.Presetupstartdt,
        true
      ) !=
      this.ActyCommonService.getUtcIsoDate(
        this.Instruction_Tab_Data.Prodstartdt,
        true
      );
    let state: string = this.Header_Data.State;
    let hasChecklistData: boolean = this.Checklist_Data.length > 0;
    let isChecklistDone: boolean = this.Header_Data.Chkflg === '1';
    if (this.activeTab === 6) {
      return false;
    }
    switch (tabIdx) {
      case 0:
        return true;
      case 1:
        if (
          state === '1' ||
          state === '2' ||
          state === '5' ||
          state === '9' ||
          state === 'B'
        ) {
          return true;
        }
        return false;
      case 2:
        if (
          (state === '2' && hasChecklistData) ||
          state === '5' ||
          state === '9' ||
          state === 'B'
        ) {
          return true;
        }
        return false;
      case 3:
        if (state === '5' || state === '9' || state === 'B') {
          return true;
        }
        return false;
      case 4:
        if (state === '5' || state === '9' || state === 'B') {
          return true;
        }
        return false;
      case 5:
        if (
          state === '5' ||
          state === '6' ||
          state === '7' ||
          state === '8' ||
          state === '9' ||
          state === 'A' ||
          state === 'B'
        ) {
          return true;
        }
        return false;
      case 6:
        return false;
      default:
        return false;
    }
  }

  async RegisterCheckList(): Promise<void> {
    //Before add check the required fields are filled or not
    if (this.requiredFieldsValidation() === false) {
      return;
    }
    await this.SaveCheckListImages();
    const checklistContent = this.Checklist_Data.map((check: any) => {
      return {
        ...check,
        Measured:
          check.Datakbn === '3' && check.Measured
            ? this.ActyCommonService.formatDateToCustomString(
                check.Measured,
                true
              )
            : check.Measured,
      };
    });

    let CheckContentData: SaveData = {
      AddList: checklistContent,
      UpdateList: [],
      DeleteList: [],
      Formid: this.textContent.FORM_ID,
      Userid: this.userId,
      Programnm: this.textContent.FORM_TITLE,
    };

    let CheckDataImages: SaveData = {
      AddList: this.ChecklistImage_Data,
      UpdateList: [],
      DeleteList: [],
      Formid: this.textContent.FORM_ID,
      Userid: this.userId,
      Programnm: this.textContent.FORM_TITLE,
    };

    this.d201Service
      .SaveDataChecklist(CheckContentData, CheckDataImages, this.Header_Data)
      .subscribe({
        next: (res) => {
          if (res?.Code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: SUCCESSMSG.S0001,
            });
            this.getHeaderData();
          }
        },
        error: (err) => {},
      });
  }

  onUploadCheckListImages(e: File[], row: any) {
    const newFiles = e.map((file, index) => {
      const fileSeq = index + 1;
      const path = `${this.fixedPath_CheckListImages}/${this.Header_Data.Planno}/${this.Header_Data.Proceseq}/${this.Header_Data.Workseq}/${row.Kbn}/${row.Seq}/${fileSeq}`;
      return { file, path };
    });

    // Replace the existing files
    row.Images = newFiles;
  }

  async SaveCheckListImages(): Promise<boolean> {
    this.ChecklistImage_Data = [];
    const success: { path: string; fileName: string }[] = [];
    let isFailure = false;
    for (const row of this.Checklist_Data) {
      if (row.Datakbn !== '4') {
        continue;
      }
      const files = row.Images ?? [];

      for (const fileObj of files) {
        const fullPath = fileObj.path;
        const parts = fullPath.split('/');
        // Get last 6 segments: Planno, Proceseq, Workseq, Kbn, Seq, Fileseq
        const len = parts.length;
        const Fileseq = parseInt(parts[len - 1], 10);
        const Seq = parseInt(parts[len - 2], 10);
        const Kbn = parts[len - 3];
        const Workseq = parseInt(parts[len - 4], 10);
        const Proceseq = parseInt(parts[len - 5], 10);
        const Planno = parts[len - 6];
        const fileName = fileObj.file.name;

        const formData = new FormData();
        formData.append('File', fileObj.file);
        formData.append('PhysicalPath', fileObj.path);

        try {
          await this.fileService.uploadFile(formData);
          success.push({
            path: fileObj.path,
            fileName: fileObj.file.name,
          });
          // Inject metadata extracted from path into ChecklistImage_Data
          this.ChecklistImage_Data.push({
            Planno,
            Proceseq,
            Workseq,
            Kbn,
            Seq,
            Fileseq,
            Filenm: fileName,
          });
        } catch (err) {
          isFailure = true;
          break;
        }
      }

      if (isFailure) break;
    }

    // Rollback logic if anything failed
    if (isFailure) {
      for (const file of success) {
        const deleteData = new FormData();
        deleteData.append('PhysicalPath', file.path);
        deleteData.append('FileName', file.fileName);

        try {
          await this.fileService.deleteFile(deleteData);
        } catch (deleteErr) {}
      }
      return false;
    }

    return true;
  }

  getCheckListCheckboxValue(row: any): boolean {
    return row.Chkflg === '1';
  }

  setCheckListCheckboxValue(row: any, value: boolean): void {
    row.Chkflg = value ? '1' : '0';
  }

  async getChecklistImageData(): Promise<void> {
    for (const item of this.Checklist_Data) {
      if (item.Datakbn === '4') {
        try {
          const res = await firstValueFrom(
            this.d201Service.GetDataChecklistImage(
              item.Planno,
              Number(item.Proceseq),
              Number(item.Seq)
            )
          );

          if (res?.Code === 200) {
            const filePaths = res.Data.Records.map(
              (r: any) =>
                CONFIG.IMAGE_FIXED_PATHS.ChecklistFileFolderPath + r.Filepath
            );

            item.Images = await this.getImagesWithPath(filePaths);
          }
        } catch (err) {}
      }
    }
  }

  async getImagesWithPath(
    filePaths: string[]
  ): Promise<{ file: File; path: string }[]> {
    if (filePaths.length === 0) return [];

    const blobs = await this.fileService.prepareBlobsFromServer(filePaths);

    const result: { file: File; path: string }[] = filePaths.map(
      (path, index) => {
        const blob = blobs[index];
        const fileName = path.split('/').pop() || `image_${index}.jpg`;

        return {
          path,
          file: new File([blob], fileName, { type: blob.type || 'image/jpeg' }),
        };
      }
    );

    return result;
  }

  async UpdateStatus(Processingevent: string): Promise<boolean> {
    const Formid = this.textContent.FORM_ID;
    const Userid = this.userId;
    const Programnm = this.textContent.FORM_TITLE;

    return new Promise<boolean>((resolve, reject) => {
      this.d201Service
        .SaveDataStatus(
          this.Header_Data,
          Processingevent,
          Formid,
          Userid,
          Programnm
        )
        .subscribe({
          next: (res) => {
            if (res?.Code === 200) {
              this.messageService.add({
                severity: 'success',
                summary: SUCCESSMSG.S0001,
              });
              this.getHeaderData();
              resolve(true);
            } else if (res?.Code === 422) {
              this.messageService.add({
                severity: 'error',
                summary: res.Message,
                sticky: true,
              });
            }
            resolve(false);
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }

  getMeasurementStepArray(): number[] {
    return Array.from({ length: this.maxMeasuretimes }, (_, i) => i + 1);
  }

  async RegisterMeasurementData(): Promise<void> {
    //Before add check the required fields are filled or not
    if (this.requiredFieldsValidation() === false) {
      return;
    }

    await this.prepareMeasurementImageDictionary();
    const measurementContent = this.MeasurementDataMap[
      this.activeMeasurementTime
    ].map((check: any) => {
      return {
        ...check,
        Measured:
          check.Datakbn === '3' && check.Measured
            ? this.ActyCommonService.formatDateToCustomString(
                check.Measured,
                true
              )
            : check.Measured,
      };
    });
    let MeasurementData_AddList = [];
    let MeasurementData_UpdateList = [];
    if (this.isMeasurementTimesRegistered(this.activeMeasurementTime)) {
      MeasurementData_UpdateList = measurementContent;
    } else {
      MeasurementData_AddList = measurementContent;
    }

    let MeasurementData: SaveData = {
      AddList: MeasurementData_AddList,
      UpdateList: MeasurementData_UpdateList,
      DeleteList: [],
      Formid: this.textContent.FORM_ID,
      Userid: this.userId,
      Programnm: this.textContent.FORM_TITLE,
    };

    const deleteList = measurementContent.reduce((acc, current) => {
      acc[current.Filenm] = {
        Measuretimes: current.Measuretimes,
        Planno: current.Planno,
        Measurementnm: current.Measurementnm,
        Proceseq: current.Proceseq,
        Seq: current.Seq,
        Workseq: current.Workseq,
        Physicalpath: CONFIG.IMAGE_FIXED_PATHS.MeasurementFileFolderPath,
      };
      return acc;
    }, {}).undefined;

    let MeasurementDataImages: SaveData = {
      AddList: this.MeasurementImage_Data,
      UpdateList: [],
      DeleteList: [deleteList],
      Formid: this.textContent.FORM_ID,
      Userid: this.userId,
      Programnm: this.textContent.FORM_TITLE,
    };

    this.d201Service
      .SaveDataMeasurement(MeasurementData, MeasurementDataImages)
      .subscribe({
        next: async (res) => {
          if (res?.Code === 200) {
            await this.uploadMeasurementImages();
            this.messageService.add({
              severity: 'success',
              summary: SUCCESSMSG.S0001,
            });
            await this.getMeasurementData();
            this.goToNextMeasurement();
          }
        },
        error: (err) => {},
      });
  }

  goToNextMeasurement(): void {
    if (
      this.isMeasurementTimesEnabled(this.activeMeasurementTime + 1) &&
      this.activeMeasurementTime < this.maxMeasuretimes
    ) {
      this.activeMeasurementTime += 1;
    }
  }

  isMeasurementTimesEnabled(time: number): boolean {
    return (
      this.isMeasurementTimesRegistered(time - 1) ||
      this.isMeasurementTimesRegistered(time)
    );
  }

  isMeasurementTimesRegistered(time: number): boolean {
    return this.MeasurementDataMap[time]?.some(
      (row) => row.isAlreadyRegistered
    );
  }

  onUploadMeasurementImages(e: File[], row: any) {
    const newFiles = e.map((file, index) => {
      const fileSeq = index + 1;
      const path = `${this.fixedPath_MeasurementImages}/${row.Planno}/${row.Proceseq}/${row.Workseq}/${row.Measuretimes}/${row.Seq}/${fileSeq}`;
      return { file, path };
    });

    // Replace the existing files
    row.Images = newFiles;
  }

  prepareMeasurementImageDictionary(): void {
    this.fileList = [];

    const currentMeasurementRows =
      this.MeasurementDataMap[this.activeMeasurementTime] || [];

    for (const row of currentMeasurementRows) {
      if (row.Datakbn !== '4') continue;

      const files = row.Images || [];
      for (const fileObj of files) {
        const fullPath = fileObj.path;
        const parts = fullPath.split('/');

        const len = parts.length;
        const [Planno, Proceseq, Workseq, Measuretimes, Seq, Fileseq] = [
          parts[len - 6],
          parseInt(parts[len - 5], 10),
          parseInt(parts[len - 4], 10),
          parseInt(parts[len - 3], 10),
          parseInt(parts[len - 2], 10),
          parseInt(parts[len - 1], 10),
        ];

        const fileName = fileObj.file.name;

        this.MeasurementImage_Data.push({
          Planno: Planno,
          Proceseq: Proceseq,
          Workseq: Workseq,
          Measuretimes: Measuretimes,
          Seq: Seq,
          Fileseq: Fileseq,
          Filenm: fileName,
        });

        this.fileList.push({
          file: fileObj.file,
          fullPath,
          fileName,
          Planno,
          Proceseq,
          Workseq,
          Measuretimes,
          Seq,
          Fileseq,
        });
      }
    }
  }

  async uploadMeasurementImages(): Promise<boolean> {
    const success: { path: string; fileName: string }[] = [];
    this.MeasurementImage_Data = [];

    for (const item of this.fileList) {
      const formData = new FormData();
      formData.append('File', item.file);
      formData.append('PhysicalPath', item.fullPath);

      try {
        await this.fileService.uploadFile(formData);
        success.push({ path: item.fullPath, fileName: item.fileName });
      } catch (uploadError) {
        // Rollback: Delete previously uploaded files
        for (const file of success) {
          const deleteForm = new FormData();
          deleteForm.append('PhysicalPath', file.path);
          deleteForm.append('FileName', file.fileName);

          try {
            await this.fileService.deleteFile(deleteForm);
          } catch {}
        }
        return false;
      }
    }

    return true;
  }

  async getMeasurementImageData(): Promise<void> {
    const allRows = Object.values(this.MeasurementDataMap).flat();

    if (allRows.length === 0) return;

    const { Planno, Proceseq } = allRows[0]; // Assumes all rows share these values

    try {
      const res = await firstValueFrom(
        this.d201Service.GetDataMeasurementImage(Planno, Proceseq)
      );

      if (res?.Code !== 200 || !res.Data?.Records) return;

      const filePaths: string[] = res.Data.Records.map(
        (r: any) =>
          CONFIG.IMAGE_FIXED_PATHS.MeasurementFileFolderPath + r.Filepath
      );

      const imagesWithFile = await this.getImagesWithPath(filePaths);

      // Build a map from composite key to images
      const imageMap = new Map<string, any[]>();

      for (const img of imagesWithFile) {
        const parts = img.path.split('/');
        const len = parts.length;

        const seq = Number(parts[len - 3]);
        const measuretimes = Number(parts[len - 4]);
        const workseq = Number(parts[len - 5]);
        const proceseq = Number(parts[len - 6]);
        const planno = parts[len - 7];

        const key = `${planno}_${proceseq}_${workseq}_${measuretimes}_${seq}`;

        if (!imageMap.has(key)) {
          imageMap.set(key, []);
        }
        imageMap.get(key)!.push(img);
      }

      // Now assign images to matching rows
      for (const row of allRows) {
        const key = `${row.Planno}_${row.Proceseq}_${row.Workseq}_${row.Measuretimes}_${row.Seq}`;
        row.Images = imageMap.get(key) ?? [];
      }
    } catch (err) {}
  }

  getCompletedRegisteredTabs(): number {
    let count = 0;

    for (const time in this.MeasurementDataMap) {
      const rows = this.MeasurementDataMap[time];
      if (rows.length > 0 && rows[0].isAlreadyRegistered === true) {
        count++;
      }
    }

    return count;
  }

  // when data is selected from reference screen this function will be executed to set that data
  async onReferenceDataSelected(event: {
    refForColumn: string;
    selectedValue: string;
    mainScreenColumnValues: { key: string; value: string }[];
  }): Promise<void> {
    if (event.refForColumn === 'Chargecd') {
      if (this.activeTab === 2) {
        // checklist tab
        // update every entry in Checklist_Data
        this.Checklist_Data = this.Checklist_Data.map((item: any) => {
          const updatedData = { ...item };
          for (const { key, value } of event.mainScreenColumnValues) {
            if (key in updatedData) {
              // Handle types carefully if needed
              updatedData[key] = value;
            }
          }

          return updatedData;
        });
      } else if (this.activeTab === 3) {
        // measurement tab
        const existingMeasurements =
          this.MeasurementDataMap[this.activeMeasurementTime] || [];

        this.MeasurementDataMap[this.activeMeasurementTime] =
          existingMeasurements.map((item: any) => {
            const updatedItem = { ...item };
            for (const { key, value } of event.mainScreenColumnValues) {
              if (key in updatedItem) {
                updatedItem[key as keyof typeof updatedItem] =
                  typeof updatedItem[key as keyof typeof updatedItem] ===
                  'number'
                    ? Number(value)
                    : value;
              }
            }
            return updatedItem;
          });
      } else if (this.activeTab === 6) {
        // reference result tab
        const updatedData = { ...this.ResultReference_ManufacturingRecord };

        for (const { key, value } of event.mainScreenColumnValues) {
          if (key in updatedData) {
            const originalValue = updatedData[key as keyof typeof updatedData];

            (updatedData as any)[key] =
              typeof originalValue === 'number' ? Number(value) : value;
          }
        }

        this.ResultReference_ManufacturingRecord = updatedData;
      }
    }
  }

  areJissekiGridsEnabled(): boolean {
    if (
      this.ResultReference_ManufacturingRecord.Workseq === null &&
      this.hasAlreadyFetchedSiyoData == false &&
      this.transsionValue['ProcessingBtn'] !==
        this.textContent.ProcessingBtn.EDIT_MODE
    ) {
      return false;
    }
    return true;
  }

  async onReferenceResultGoodqtyChange(): Promise<void> {
    if (
      this.ResultReference_ManufacturingRecord.Goodqty &&
      this.ResultReference_ManufacturingRecord.Goodqty !== null &&
      this.ResultReference_ManufacturingRecord.Workseq === null &&
      this.hasAlreadyFetchedSiyoData == false &&
      this.transsionValue['ProcessingBtn'] !==
        this.textContent.ProcessingBtn.EDIT_MODE
    ) {
      await this.getResultSiyoReferenceData();
      this.hasAlreadyFetchedSiyoData = true;
    }
    // Wait for Angular to finish rendering
    // ngZone.onStable returns when all angular background tasks are complete
    // take(1) says that return the first instanct when app is idle
    await firstValueFrom(this.ngZone.onStable.pipe(take(1)));

    const Goodqty: number =
      this.ResultReference_ManufacturingRecord.Goodqty ?? 0;
    let usedItemGridVisibleDataList =
      this.ResultReferenceUsedItems.visibleDataList();
    usedItemGridVisibleDataList.forEach((row: any) => {
      const Oyaqty: number = row.Oyaqty;
      const Koqty: number = row.Koqty;
      const Actualqty: number = Goodqty * (Koqty / Oyaqty);

      row.Actualqty = Actualqty;
      this.ResultReferenceUsedItems.currentGridDataMode = 2; //edit mode
      this.ResultReferenceUsedItems.currData = row;
      this.ResultReferenceUsedItems.onDialogSaveData();
    });
  }

  ValidateManufacturingField(
    column: string,
    isOnChange: boolean = false
  ): boolean {
    const record = this.ResultReference_ManufacturingRecord as any;

    // if on change then only remove errors
    if (isOnChange) {
      delete record.errors[column];
      return true;
    }

    const value = record[column];

    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '');

    if (!record.errors) {
      record.errors = {};
    }

    if (isEmpty) {
      record.errors[column] = ERRMSG.E0009;
      return false;
    } else {
      delete record.errors[column];
      return true;
    }
  }

  hasManufacturingFieldError(column: string): boolean {
    const record = this.ResultReference_ManufacturingRecord as any;
    const error = record.errors?.[column];

    const isDefined = error !== undefined;
    const isNotNull = error !== null;
    const isNotEmptyString = String(error).trim() !== '';

    return isDefined && isNotNull && isNotEmptyString;
  }

  JissekiTabValidation(): boolean {
    // validation
    let hasEmptyChargecd: boolean =
      !this.ValidateManufacturingField('Chargecd');
    let hasEmptyLotno: boolean = !this.ValidateManufacturingField('Lotno');
    let hasEmptyGoodqty: boolean = !this.ValidateManufacturingField('Goodqty');

    if (hasEmptyChargecd || hasEmptyLotno || hasEmptyGoodqty) {
      this.messageService.add({
        severity: 'error',
        summary: ERRMSG.E0013,
        sticky: true,
      });
      return false;
    }

    let hasNegativeGoodqty =
      this.ResultReference_ManufacturingRecord.Goodqty &&
      this.ResultReference_ManufacturingRecord.Goodqty < 0;

    if (hasNegativeGoodqty) {
      this.ResultReference_ManufacturingRecord.errors['Goodqty'] = ERRMSG.E0015;
      return false;
    }

    let hasSameLotforDiffHmno: boolean = false; // TODO confirm same label
    let hasActualqtyMorethanStock: boolean = false;

    const UsedItemsVisibleList =
      this.ResultReferenceUsedItems.visibleDataList();
    const hmnoLotMap: Record<string, string> = {};

    for (const item of UsedItemsVisibleList) {
      const { Hmno, Lotno, Actualqty, Stockqty } = item;

      // Check for different Lotno for same Hmno
      if (Hmno) {
        if (hmnoLotMap[Hmno] && hmnoLotMap[Hmno] !== Lotno) {
          hasSameLotforDiffHmno = true;
          break;
        } else if (!hmnoLotMap[Hmno]) {
          hmnoLotMap[Hmno] = Lotno;
        }
      }

      // Check if Actualqty exceeds Stockqty
      const actual = Number(Actualqty);
      const stock = Number(Stockqty);
      if (!isNaN(actual) && !isNaN(stock) && actual > stock) {
        hasActualqtyMorethanStock = true;
        break;
      }
    }

    if (hasSameLotforDiffHmno) {
      this.messageService.add({
        severity: 'error',
        summary: ERRMSG.E0014,
        sticky: true,
      });
      return false;
    }

    if (hasActualqtyMorethanStock) {
      this.messageService.add({
        severity: 'error',
        summary: ERRMSG.E0016,
        sticky: true,
      });
      return false;
    }

    return true;
  }

  async jissekiTabBeforeConfirmation(): Promise<boolean> {
    //confirmation
    let confirmationMsg: string = '';
    let processingBtn = this.transsionValue['ProcessingBtn'];
    if (processingBtn === this.textContent.ProcessingBtn.EDIT_MODE) {
      confirmationMsg = CONFIRMMSG.C0015;
    } else if (
      processingBtn === this.textContent.ProcessingBtn.END_PRODUCTION_BTN
    ) {
      confirmationMsg = CONFIRMMSG.C0016;
    } else if (
      processingBtn === this.textContent.ProcessingBtn.START_BREAK_BTN
    ) {
      confirmationMsg = CONFIRMMSG.C0018;
    } else if (processingBtn === this.textContent.ProcessingBtn.INTERRUPT_BTN) {
      confirmationMsg = CONFIRMMSG.C0018;
    } else if (
      processingBtn === this.textContent.ProcessingBtn.PRODUCTION_HANDOVER_BTN
    ) {
      confirmationMsg = CONFIRMMSG.C0017;
    }

    const confirmationResult: number = await this.confirmDialog.show({
      message: confirmationMsg,
      buttons: [
        {
          label: TOROKU.NO,
        },
        {
          label: TOROKU.YES,
          severity: 'primary',
        },
      ],
    });
    if (confirmationResult === 0) {
      return false;
    } else {
      return true;
    }
  }

  async SaveResultReference(
    isAlreadyValidated: boolean = false
  ): Promise<void> {
    if (!isAlreadyValidated && this.JissekiTabValidation() === false) {
      return;
    }

    const UsedItemsVisibleLsit =
      this.ResultReferenceUsedItems.visibleDataList();
    const DefectiveItemsVisibleLsit =
      this.ResultReferenceDefectiveItems.visibleDataList();

    //confirmation
    let processingBtn = this.transsionValue['ProcessingBtn'];

    if (
      !isAlreadyValidated &&
      (await this.jissekiTabBeforeConfirmation()) === false
    ) {
      return;
    }

    let UsedItemsData: SaveData = {
      AddList: [],
      UpdateList: [],
      DeleteList: [],
      Formid: this.textContent.FORM_ID,
      Userid: this.userId,
      Programnm: this.textContent.FORM_TITLE,
    };

    let Defectivedata: SaveData = {
      AddList: [],
      UpdateList: [],
      DeleteList: [],
      Formid: this.textContent.FORM_ID,
      Userid: this.userId,
      Programnm: this.textContent.FORM_TITLE,
    };

    if (this.ResultReference_ManufacturingRecord.Workseq === null) {
      UsedItemsData.AddList = UsedItemsVisibleLsit;
      Defectivedata.AddList = DefectiveItemsVisibleLsit;
    } else {
      const useditems = await this.ResultReferenceUsedItems.getSaveData();
      const defectiveitems =
        await this.ResultReferenceDefectiveItems.getSaveData();

      UsedItemsData.AddList = useditems.AddList;
      UsedItemsData.UpdateList = useditems.UpdateList;
      UsedItemsData.DeleteList = useditems.DeleteList;

      Defectivedata.AddList = defectiveitems.AddList;
      Defectivedata.UpdateList = defectiveitems.UpdateList;
      Defectivedata.DeleteList = defectiveitems.DeleteList;
    }

    this.ResultReference_ManufacturingRecord.Badqty =
      DefectiveItemsVisibleLsit.reduce(
        (sum: number, item: any) => Number(sum) + (Number(item.Badqty) ?? 0),
        0
      );

    this.ResultReference_ManufacturingRecord.ProcessingBtn = processingBtn;

    this.d201Service
      .SaveDataResultReference(
        Defectivedata,
        UsedItemsData,
        this.ResultReference_ManufacturingRecord,
        this.Header_Data
      )
      .subscribe({
        next: async (res) => {
          if (res?.Code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: SUCCESSMSG.S0001,
            });
            this.DataChangeDetected.dataChangeListReset();
            await this.getHeaderData();
            if (
              processingBtn ===
                this.textContent.ProcessingBtn.END_PRODUCTION_BTN ||
              processingBtn === this.textContent.ProcessingBtn.EDIT_MODE
            ) {
              this.activeTab = 5;
            } else {
              this.opsButtonClick('back_to_list_btn');
            }
          }
        },
        error: (err) => {},
      });
  }

  // after input is finished this block will be executed
  // mainly attached on change and enter press events
  async onInputFinished(field: string, data: any): Promise<void> {
    this.setRefScreenRowData(data, field);
  }

  /**
   * function will set refScreenOnRowData which is used for getting reference data without opening the reference screen
   * @param rowData
   * @param column
   */
  setRefScreenRowData(rowData: any, column: string): void {
    let fieldVal = '';
    if (this.activeTab === 2) {
      fieldVal = (this.Checklist_Data[0] as any)[column];
    } else if (this.activeTab === 3) {
      fieldVal = (
        this.MeasurementDataMap[this.activeMeasurementTime][0] as any
      )[column];
    } else if (this.activeTab === 6) {
      if (column === 'Chargecd') {
        fieldVal = rowData.Chargecd;
      }
    }
    if (fieldVal !== null && fieldVal !== '') {
      /**
       * refScreenOnRowData is given as input in reference button which searches for data
       * based on refScreenOnRowData set here.
       */
      this.refScreenOnRowData.set({
        tableName: this.Torokusha_refTableName,
        queryID: '',
        columns: this.Torokusha_refColumns,
        rowId: -1,
        refForColumn: column,
        selectedValue: rowData[column],
        defaultValue: {},
      });
    } else {
      this.Torokusha_refColumns.forEach((refCol: any) => {
        if (refCol.mainScreenColumn) {
          rowData[refCol.mainScreenColumn] = null;
        }
      });
    }
  }

  onFieldInput(fieldName: string): void {
    this.InvalidMSG[fieldName] = '';
  }

  requiredFieldsValidation(): boolean {
    let noError = true;
    if (this.activeTab === 2) {
      if (
        this.Checklist_Data[0].Chargecd === '' ||
        this.Checklist_Data[0].Chargecd === null
      ) {
        this.InvalidMSG['Chargecd_CheckList'] = ERRMSG.E0009;
        noError = false;
      }

      this.Checklist_Data.forEach((item: any) => {
        if (item.Measurerequiredkbn === '1' && item.Chkflg !== '1') {
          item._error = ERRMSG.E0009;
        } else if (
          (item.Measurerequiredkbn === '2' &&
            (item.Datakbn === '1' ||
              item.Datakbn === '2' ||
              item.Datakbn === '3') &&
            item.Measured === '') ||
          item.Measured === null
        ) {
          item._error = ERRMSG.E0009;
          noError = false;
        } else if (
          item.Measurerequiredkbn === '2' &&
          item.Datakbn === '4' &&
          (!item.Images || item.Images.length === 0)
        ) {
          item._error = ERRMSG.E0009;
          noError = false;
        }
      });
    } else if (this.activeTab === 3) {
      if (
        this.MeasurementDataMap[this.activeMeasurementTime][0].Chargecd ===
          '' ||
        this.MeasurementDataMap[this.activeMeasurementTime][0].Chargecd === null
      ) {
        this.InvalidMSG['Chargecd_Measurement'] = ERRMSG.E0009;
        noError = false;
      }

      this.MeasurementDataMap[this.activeMeasurementTime].forEach(
        (item: any) => {
          if (
            ((item.Datakbn === '1' || item.Datakbn === '2') &&
              item.Measured === '') ||
            item.Measured === null
          ) {
            item._error = ERRMSG.E0009;
            noError = false;
          } else if (item.Datakbn === '3') {
            item._error = ERRMSG.E0009;
            noError = false;
          } else if (
            item.Datakbn === '4' &&
            (!item.Images || item.Images.length === 0)
          ) {
            item._error = ERRMSG.E0009;
            noError = false;
          }
        }
      );
    }

    return noError;
  }

  async BackFromJissekiTab(): Promise<void> {
    const result = await this.confirmChanges();
    if (result.hasChanges === true && result.proceed === false) {
      return; // User chose not to proceed with changes
    }
    this.activeTab = this.transsionValue['LastActiveTab'];
  }

  MoveToJissekiTab(): void {
    let processingBtn = this.transsionValue['ProcessingBtn'];

    if (processingBtn === this.textContent.ProcessingBtn.EDIT_MODE) {
      this.JissekiTabLabel = this.textContent.EDIT_JISSEKI_LBL;
    } else {
      this.JissekiTabLabel = this.textContent.NEW_JISSEKI_LBL;
    }

    this.activeTab = 6;
    this.getResultReferenceData();
    this.hasAlreadyFetchedSiyoData = false;
  }

  jissekiTabChangeDetectValidate(
    field: string,
    columnData: any,
    dataType: string
  ): boolean {
    const initialValue = (this.oldResultReference_ManufacturingRecord as any)[
      field
    ];
    if (dataType === '1') {
      if ((initialValue ?? '') !== (columnData ?? '')) {
        this.DataChangeDetected.dataChangeListPush(field);
      } else {
        this.DataChangeDetected.dataChangeListRemove(field);
      }
    } else if (dataType === '2') {
      if (String(initialValue ?? '') !== String(columnData ?? '')) {
        this.DataChangeDetected.dataChangeListPush(field);
      } else {
        this.DataChangeDetected.dataChangeListRemove(field);
      }
    } else if (dataType === '3') {
      if (
        this.ActyCommonService.getUtcIsoDate(columnData) !==
        this.ActyCommonService.getUtcIsoDate(initialValue)
      ) {
        this.DataChangeDetected.dataChangeListPush(field);
      } else {
        this.DataChangeDetected.dataChangeListRemove(field);
      }
    } else if (dataType === '4') {
      if ((initialValue ?? '') !== (columnData ?? '')) {
        this.DataChangeDetected.dataChangeListPush(field);
      } else {
        this.DataChangeDetected.dataChangeListRemove(field);
      }
    }
    return true;
  }

  /**
   * shows the dialog to confirm the saving of unsaved changes on deactivation of some other custom case
   * @returns
   */
  async confirmChanges(): Promise<changesReturn> {
    //check the data is changed or not
    if (
      this.DataChangeDetected.dataChangeList.length === 0 &&
      this.DataChangeDetected.netRowChangeCounter === 0
    ) {
      return { proceed: true, hasChanges: false }; // No changes, proceed without alert
    }

    const result = await this.confirmDialog.show({
      message: CONFIRMMSG.C0001,
      buttons: [
        {
          label: this.textContent.DIALOG_CANCEL_BTN,
        },
        {
          label: this.textContent.NO_BTN,
        },
        {
          label: this.textContent.JISSEKI_REGISTER_BTN,
          severity: 'primary',
        },
      ],
    });

    if (result === 2) {
      // YES pressed
      if (
        this.JissekiTabValidation() === false ||
        (await this.jissekiTabBeforeConfirmation()) === false
      ) {
        return { proceed: false, hasChanges: true }; // Required fields not filled, do not proceed
      } else {
        this.SaveResultReference(true);
        this.DataChangeDetected.dataChangeListReset();
        return { proceed: true, hasChanges: true }; // Proceed with save if success
      }
    } else if (result === 1) {
      // NO pressed
      return { proceed: true, hasChanges: true }; // Proceed without saving
    }

    // Default return to handle unexpected cases
    return { proceed: false, hasChanges: true };
  }
}
