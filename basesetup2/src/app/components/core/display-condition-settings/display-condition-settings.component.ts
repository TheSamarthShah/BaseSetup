import {
  Component,
  HostListener,
  inject,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { FILTER } from '../../../model/core/filter.type';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { ConditionSettingDisplayService } from '../../../services/core/condition-setting-display.service';
import {
  CONDITION_SETTING_DISP,
  COMMON,
  FILTER_TEXT,
} from '../../../shared/jp-text';
import { ConditionSettingsDisplay } from '../../../model/core/conditionSettingDisplay.type';
import { ERRMSG, INFOMSG, SUCCESSMSG } from '../../../shared/messages';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { CONFIG } from '../../../shared/config';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { MaxLengthDirective } from '../../../directives/max-length.directive';
import { DatePickerModule } from 'primeng/datepicker';
import { ActyCommonService } from '../../../services/shared/acty-common.service';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-display-condition-settings',
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    ButtonModule,
    DialogModule,
    InputText,
    RadioButtonModule,
    CheckboxModule,
    TableModule,
    DividerModule,
    TooltipModule,
    SelectModule,
    MessageModule,
    MaxLengthDirective,
    DatePickerModule,
  ],
  templateUrl: './display-condition-settings.component.html',
  styleUrl: './display-condition-settings.component.scss',
})
export class DisplayConditionSettingsComponent implements OnChanges {
  service = inject(ConditionSettingDisplayService);
  //for displaying Toast messages
  messageService = inject(MessageService);
  //get data from cookies
  cookieService = inject(CookieService);
  ActyCommonService = inject(ActyCommonService);

  formId = input.required<string>();
  //flag to manage hide and show of popup
  displayInp = input<boolean>(false);
  //list to manage search columns
  seachColsInp = input.required<Array<FILTER>>();

  //to trigger the model clossed event
  closeTriggered = output();
  //output the updated searchlist
  loadTriggerd = output<Array<FILTER>>();

  loginUserId = JSON.parse(this.cookieService.get('user') ?? '').userid;
  //variable for all the texts stored in constants
  textContent: any = CONDITION_SETTING_DISP;
  textContentCommon: any = COMMON;
  textContentFilter: any = FILTER_TEXT;
  errMsg: string = ERRMSG.E0009;
  match_options_string: {
    code: string;
    name: string;
  }[] = [
    { code: '1', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.RANGE },
    { code: '2', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.EQ },
    { code: '3', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.NEQ },
    { code: '4', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.SW },
    { code: '5', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.NSW },
    { code: '6', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.EW },
    { code: '7', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.NEW },
    { code: '8', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.CON },
    { code: '9', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.NCON },
    { code: '10', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.IN },
    { code: '11', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.INN },
  ];
  match_options_num_date: {
    code: string;
    name: string;
  }[] = [
    { code: '1', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.RANGE },
    { code: '2', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.EQ },
    { code: '3', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.NEQ },
    { code: '10', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.IN },
    { code: '11', name: FILTER_TEXT.FILTER_MATCH_CONDITIONS.INN },
  ];
  accesskbn_options = [
    {
      code: '1',
      name: this.textContent.ACCESS_TYPE_OPTIONS[0],
    },
    {
      code: '2',
      name: this.textContent.ACCESS_TYPE_OPTIONS[1],
    },
  ];
  lastConditionno: string = '';
  activeTab: number = 0;
  pageSizes: number[] = CONFIG.CONDITION_SET_DISP.PAGESIZES;
  selectedData: ConditionSettingsDisplay | null = null;
  isTouchDevice: boolean = this.ActyCommonService.isTouchDevice();
  allCheckedStates: any = {};

  //variable for managing loader
  // to show increament by 1 this.isLoading.update((n) => n + 1);
  // to hide decreament by 1 till 0 this.isLoading.update((n) => Math.max(n - 1, 0));
  isLoading = signal<number>(0);
  displayFlg = signal(false);
  searchCols = signal<Array<FILTER>>([]);
  //used toi filter data in first tab
  searchObj = signal({
    conditionnm: '',
    accesskbn: ['1', '2'],
    registedUsers: '',
  });
  //used to save data in second tab
  saveObj = signal({
    conditionno: '',
    conditionnm: '',
    invalidConditionnm: false,
    accesskbn: '1',
  });
  dataList = signal<Array<ConditionSettingsDisplay>>([]);
  //to decide whether to allow editing on second panel or not
  canEdit = signal(true);

  @HostListener('window:resize')
  onResize(): void {
    this.updateScrollHeight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['displayInp']) {
      this.displayFlg.set(this.displayInp());
      if (this.displayFlg() === true) {
        //Initially 'すべて' (Select All) related check box is checked
        this.seachColsInp()
          .filter((data) => data.data_type === '4')
          .forEach((column) => {
            this.onAllCheckboxChange(column, '');
        });
      }
    }
    if (changes['seachColsInp'] && this.seachColsInp()) {
      this.searchCols.set(this.seachColsInp().map((item) => ({ ...item })));
    }
  }

  openModel(): void {
    this.activeTab = 0;
    setTimeout(() => {
      this.updateScrollHeight();
    }, 1);
    this.firstTabClicked();
    this.getData();
  }

  closeModel(): void {
    this.displayFlg.set(false);
    this.closeTriggered.emit();
  }

  /**
   * get the kbn value by its key from memberList
   * @param key
   * @param memberList
   * @returns
   */
  getKBNNm(
    code: string,
    memberList: { code: string; name: string }[]
  ): string | undefined {
    return memberList.find((l) => l.code === code)?.name;
  }

  /**
   * Gets the list of condition settings
   */
  getData(): void {
    //set loading to true to show the loader at the time of start of data fetch
    this.isLoading.update((n) => n + 1);
    this.dataList.set([]);
    this.service
      .getConditionSettings(
        this.searchObj().conditionnm,
        this.searchObj().accesskbn,
        this.searchObj().registedUsers,
        this.formId()
      )
      .subscribe({
        next: (res) => {
          if (res.Code === 200) {
            const data = res.Data.ConditionSettingData;
            this.dataList.set(data);
            this.selectedData = data[0];
          } else if (res.Code === 201) {
            this.messageService.add({
              severity: 'info',
              summary: INFOMSG.I0001,
            });
          }
          //set loading to false to hide the loader at the time of end of data fetch
          this.isLoading.update((n) => Math.max(n - 1, 0));
        },
        error: (err) => {
          //set loading to false to hide the loader at the time of end of data fetch
          this.isLoading.update((n) => Math.max(n - 1, 0));
        },
      });
  }

  /**
   * Fetches the setting data of conditionno and loads it in this.searchCols()
   * @param conditionno
   * @param conditionnm
   * @param accesskbn
   * @param mode  0 --> directly load the data in form, 1 --> open second tab in readonly mode, 2 --> open second tab in edit mode
   */
  loadConditionSettingData(
    conditionno: string,
    conditionnm: string,
    accesskbn: string,
    mode: number
  ): void {
    //setting activeTab to 0 for changeDetection
    this.activeTab = 0;
    this.lastConditionno = conditionno;
    this.service.getConditionSetting(conditionno).subscribe({
      next: (res) => {
        if (res.Code === 200) {
          const data = res.Data.ConditionSettingData;
          for (let indx = 0; indx < data.length; indx++) {
            const searchColsObj = this.searchCols().find(
              (d) => d.name === data[indx].COLUMNNAME
            );
            if (searchColsObj) {
              searchColsObj.value_from =
                data[indx].CHECKVALUE !== null
                  ? data[indx].CHECKVALUE.split(',').map((item: string) =>
                      item.replace(/'/g, '').trim()
                    )
                  : data[indx].FROMVALUE !== null
                  ? data[indx].FROMVALUE
                  : '';
              searchColsObj.value_to =
                data[indx].TOVALUE !== null ? data[indx].TOVALUE : '';
              searchColsObj.visible = data[indx].VISIBLE === '1';
              searchColsObj.match_type = data[indx].COMBOVALUE;
            }
          }
          //load data and close the popup
          if (mode === 0) {
            this.closePopupWithData();
          } else {
            if (mode === 1) {
              //data cannot be edited
              this.canEdit.set(false);
            } else {
              //data can be edited
              this.canEdit.set(true);
            }
            //opening second tab
            this.activeTab = 1;
            setTimeout(() => {
              this.updateScrollHeight();
            }, 5);
            this.saveObj.set({
              conditionno: conditionno,
              conditionnm: conditionnm,
              invalidConditionnm: false,
              accesskbn: accesskbn,
            });
          }
        } else if (res.statusCode === 100) {
          this.messageService.add({
            severity: 'info',
            summary: INFOMSG.I0001,
          });
        }
        //set loading to false to hide the loader at the time of end of data fetch
        this.isLoading.update((n) => Math.max(n - 1, 0));
      },
      error: (err) => {
        //set loading to false to hide the loader at the time of end of data fetch
        this.isLoading.update((n) => Math.max(n - 1, 0));
      },
    });
  }

  deleteConditionSettingData(conditionno: string): void {
    this.service.deleteConditionSetting(conditionno).subscribe({
      next: (res) => {
        if (res.Code === 200) {
          this.getData();
        }
      },
    });
  }

  //reset the filters
  resetFilter(): void {
    this.searchObj.set({
      conditionnm: '',
      accesskbn: ['1', '2'],
      registedUsers: '',
    });
  }

  //reset all the setting of search columns
  resetConditionSetting(): void {
    this.searchCols.set(
      this.searchCols().map((data) => ({
        ...data,
        value_from:
          data.data_type === '4' && data.memberList
            ? data.memberList?.map((m) => m.code)
            : data.data_type === '6' && data.memberList?.length
            ? data.memberList[0].code
            : '',
        value_to: '',
        match_type: data.data_type === '1' ? '4' : '1',
        visible: true,
        invalidInput: false,
      }))
    );
  }

  /**
   * binded when 読込 tab is clicked
   */
  firstTabClicked(): void {
    this.canEdit.set(true);
    //reset selected changeno and changenm
    this.saveObj.set({
      conditionno: '',
      conditionnm: '',
      invalidConditionnm: false,
      accesskbn: '1',
    });
    //reset data with user's input setting
    this.searchCols.set(this.seachColsInp().map((item) => ({ ...item })));
  }

  OnInputEvent(name: string): void {
    if (name === 'changenm') {
      this.saveObj.update((state) => ({
        ...state,
        invalidConditionnm: false,
      }));
      //set scroll height as height of the input div is decreased
      setTimeout(() => {
        this.updateScrollHeight();
      }, 1);
    }
  }

  saveData(): void {
    //reset data before validating it
    this.saveObj.update((state) => ({
      ...state,
      invalidConditionnm: false,
    }));
    //validate changenm is there or not
    if (this.saveObj().conditionnm === '') {
      this.saveObj.update((state) => ({
        ...state,
        invalidConditionnm: true,
      }));
      //set scroll height as height of the input div is increased
      setTimeout(() => {
        this.updateScrollHeight();
      }, 1);
      return;
    }
    this.service
      .saveConditionSetting(
        this.saveObj().conditionno,
        this.saveObj().conditionnm,
        this.formId(),
        this.saveObj().accesskbn,
        this.searchCols()
      )
      .subscribe({
        next: (res) => {
          if (res.Code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: SUCCESSMSG.S0001,
            });
            this.lastConditionno = res.Data.Conditionno;
            //hide all the popups
            this.closePopupWithData();
          }
        },
      });
  }

  /**
   * closes the dialog by updating setting for this.lastConditionno and emits this.searchCols()
   */
  closePopupWithData(): void {
    this.displayFlg.set(false);
    this.service
      .updateLastConditionno(
        this.lastConditionno,
        this.loginUserId,
        this.formId()
      )
      .subscribe({
        next: (res) => {
          if (res.Code === 200) {
          }
        },
      });
    this.loadTriggerd.emit(this.searchCols());
  }

  onDirectLoadBtnClick(): void {
    if (this.selectedData) {
      this.loadConditionSettingData(
        this.selectedData.CONDITIONNO,
        this.selectedData.CONDITIONNM,
        this.selectedData.ACCESSKBN,
        0
      );
    }
  }

  tabChange(tab: any): void {
    setTimeout(() => {
      this.activeTab = Number(tab);
      this.updateScrollHeight();
    }, 1);
    if (this.activeTab === 0) {
      this.firstTabClicked();
    }
  }

  updateScrollHeight(): void {
    //setting scroll of table in first div
    const dataDiv: HTMLElement = document.querySelector(
      '.condMainDiv'
    ) as HTMLElement;
    if (!dataDiv) return;

    if (this.activeTab === 0) {
      const paginationHeight: number =
        dataDiv.querySelector('.p-paginator')?.clientHeight ?? 0;
      const filterHeight: number =
        dataDiv.querySelector('.conFilterDiv')?.clientHeight ?? 0;
      const seperatorHeight: number = 28;
      const availableHeight: number =
        dataDiv.clientHeight -
        paginationHeight -
        filterHeight -
        seperatorHeight -
        50;
      const tableContainer: HTMLElement = dataDiv.querySelector(
        '.firstDiv .p-datatable-table-container'
      ) as HTMLElement;
      if (tableContainer) {
        tableContainer.style.height = `${availableHeight}px`;
        tableContainer.style.maxHeight = `${availableHeight}px`;
      }
    } else {
      const inputDivHeight: number =
        dataDiv.querySelector('.inputDiv')?.clientHeight ?? 0;
      const buttonsDivHeight: number =
        dataDiv.querySelector('.buttonsDiv')?.clientHeight ?? 0;
      const seperatorHeight: number = 28;
      const availableHeight: number =
        dataDiv.clientHeight -
        inputDivHeight -
        seperatorHeight -
        buttonsDivHeight -
        65;
      const tableContainer: HTMLElement = dataDiv.querySelector(
        '.secondDiv .p-datatable-table-container'
      ) as HTMLElement;
      if (tableContainer) {
        tableContainer.style.height = `${availableHeight}px`;
        tableContainer.style.maxHeight = `${availableHeight}px`;
      }
    }
  }

  //This function toggles all checkboxes on or off according to the state of the 'すべて' (Select All) checkbox
  onAllCheckboxChange(column: FILTER, memberCode: string): void {
    if (memberCode === 'ALL') {
      const checkboxId = `${column.name}_CndSet_ALL`;
      const checkboxElement = document.getElementById(
        checkboxId
      ) as HTMLInputElement;
      const isChecked = checkboxElement?.checked;

      if (!isChecked) {
        // Uncheck all by filtering out all members of this column
        column.value_from = (column.value_from as string[]).filter(
          (code) =>
            !(column.memberList ?? []).some((member) => member.code === code)
        );
      } else {
        // Check all by adding all member codes not already present
        column.value_from = (column.memberList ?? []).map(
          (member) => member.code
        );
      }
    } else {
      // Handle individual checkbox changes
      const allChecked = (column.memberList ?? [])
        .filter((member) => member.code !== 'ALL')
        .every((member) =>
          (column.value_from as string[]).includes(member.code)
        );

      // Update the state of the 'すべて' (Select All) checkbox
      this.allCheckedStates[column.name] = allChecked;
    }
  }
}
