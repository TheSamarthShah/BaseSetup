import { Component, inject, signal, ViewChild } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';
import { FilterComponent } from '../../core/filter/filter.component';
import { GridComponent } from '../../core/grid/grid.component';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { CONFIG } from '../../../shared/config';
import { FILTER } from '../../../model/core/filter.type';
import { ActyCommonService } from '../../../services/shared/acty-common.service';
import { GRID } from '../../../model/core/grid.type';
import { CookieService } from 'ngx-cookie-service';
import { F101 } from '../../../shared/jp-text';
import { API_ENDPOINTS } from '../../../shared/api-endpoint';
import { MessageService } from 'primeng/api';
import { ERRMSG } from '../../../shared/messages';

@Component({
  selector: 'app-f101',
  imports: [SplitterModule, FilterComponent, GridComponent, LoaderComponent],
  templateUrl: './f101.component.html',
  styleUrl: './f101.component.scss',
})
export class F101Component {
  @ViewChild(GridComponent) gridComponent!: GridComponent;
  @ViewChild(FilterComponent) filterComponent!: FilterComponent;

  ActyCommonService = inject(ActyCommonService);
  cookieService = inject(CookieService);
  messageService = inject(MessageService);

  userId: string = JSON.parse(this.cookieService.get('user') ?? '').userid;
  //variable for all the texts stored in constants
  textContent: any = F101;
  formId: string = this.textContent.FORM_ID;
  formName: string = this.textContent.FORM_TITLE;
  //This URL is used to fetch the data
  getDataUrl: string = API_ENDPOINTS.F101.GET;
  //This URL is used to export the data
  exportURL: string = '';
  //pagesizes stored in config file
  pageSize: number[] = CONFIG.F101.PAGESIZES;

  HINMOKU_JOKEN_KBN_OPTIONS: {
    code: string;
    name: string;
  }[] = [
    { code: '1', name: this.textContent.HINMOKU_JOKEN_KBN_OPTIONS[0] },
    { code: '2', name: this.textContent.HINMOKU_JOKEN_KBN_OPTIONS[1] },
    { code: '3', name: this.textContent.HINMOKU_JOKEN_KBN_OPTIONS[2] },
  ];

  dataGrid: GRID[] = [
    {
      name: 'Fromdt',
      displayName: this.textContent.FROM_DATE,
      dataType: '3',
      searchVisible: true,
      searchRequired: true,
      showMatchType: false,
      tableName: '',
      visible: false,
      frozen: false,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Days',
      displayName: this.textContent.DAYS,
      dataType: '2',
      searchVisible: true,
      searchRequired: true,
      showMatchType: false,
      tableName: '',
      visible: false,
      frozen: false,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Hmno',
      displayName: this.textContent.HMNO,
      dataType: '1',
      searchVisible: true,
      tableName: '',
      visible: true,
      frozen: true,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Hinmokujokenkbn',
      displayName: this.textContent.HINMOKU_JOKEN_KBN,
      dataType: '6',
      searchVisible: true,
      tableName: '',
      visible: false,
      frozen: false,
      width: '',
      isReferenceScreen: false,
      memberList: this.HINMOKU_JOKEN_KBN_OPTIONS,
    },
    {
      name: 'Qtylabel',
      displayName: '',
      dataType: '1',
      searchVisible: false,
      tableName: '',
      visible: true,
      frozen: true,
      width: '',
      isReferenceScreen: false,
    },
  ];

  initielDataGrid: GRID[] = [
    {
      name: 'Fromdt',
      displayName: this.textContent.FROM_DATE,
      dataType: '3',
      searchVisible: true,
      searchRequired: true,
      showMatchType: false,
      tableName: '',
      visible: false,
      frozen: false,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Days',
      displayName: this.textContent.DAYS,
      dataType: '2',
      searchVisible: true,
      searchRequired: true,
      showMatchType: false,
      tableName: '',
      visible: false,
      frozen: false,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Hmno',
      displayName: this.textContent.HMNO,
      dataType: '1',
      searchVisible: true,
      tableName: '',
      visible: true,
      frozen: true,
      width: '',
      isReferenceScreen: false,
    },
    {
      name: 'Hinmokujokenkbn',
      displayName: this.textContent.HINMOKU_JOKEN_KBN,
      dataType: '6',
      searchVisible: true,
      tableName: '',
      visible: false,
      frozen: false,
      width: '',
      isReferenceScreen: false,
      memberList: this.HINMOKU_JOKEN_KBN_OPTIONS,
    },
    {
      name: 'Qtylabel',
      displayName: '',
      dataType: '1',
      searchVisible: false,
      tableName: '',
      visible: true,
      frozen: true,
      width: '',
      isReferenceScreen: false,
    },
  ];

  //variable for managing loader
  // to show increament by 1 this.isLoading.update((n) => n + 1);
  // to hide decreament by 1 till 0 this.isLoading.update((n) => Math.max(n - 1, 0));
  isLoading = signal<number>(0);
  //flag to indicate that data is being loaded in background
  isBackgroundOn = signal(false);
  //splitter sizes
  splitterSizes = signal<number[]>(CONFIG.DEFAULT.SPITTERSIZES);
  //splitter min sizes
  splitterMinSizes = signal<number[]>(CONFIG.DEFAULT.SPITTERMINSIZES);
  //searchlist to be used to filter data from filter component
  searchList = signal<FILTER[]>(
    this.ActyCommonService.transformDataGridToFilterList(this.dataGrid)
  );
  weekendColumnColor = signal<
    {
      columnName: string;
      color: string;
      darkModeColor?: string;
      headerOnly?: boolean; // true = only header, false = whole column
    }[]
  >([]);

  //called when splitter is moved and updates the grid and filter div scroll height
  onSplitterMoved(event: any): void {
    this.splitterSizes.set([
      Math.round(event.sizes[0]),
      Math.round(event.sizes[1]),
    ]);

    const currentTopPanelSize = this.splitterSizes()[0];
    const minTopPanelSize = this.splitterMinSizes()[0];
    if (currentTopPanelSize > minTopPanelSize) {
      this.filterComponent.isShowFilter.set(true);
    } else {
      this.filterComponent.isShowFilter.set(false);
    }
    this.updateGridScrollHeight();
  }

  //called when splitter is toggled
  splitterToggle(event: boolean): void {
    let sizes: number[] = [];

    if (event) {
      sizes = [40, 60];
    } else {
      sizes = this.ActyCommonService.getSplitterToggleSizes();
    }

    this.splitterSizes.set(sizes);
    this.updateGridScrollHeight();
  }

  //Update grid scroll height
  updateGridScrollHeight(): void {
    if (this.gridComponent) {
      this.gridComponent.updateScrollHeight();
    }
  }

  //update search data to catch when search data is changed from filter
  updateSearchData(updatedSearch: FILTER[]): void {
    this.searchList.set(updatedSearch);
  }

  //calling getData of grid to fetch data from API when search is trgirred from FILTER
  getData() {
    if (!this.gridComponent) return;

    const searchItems = this.searchList();

    const fromdtItem = searchItems.find((item: any) => item.name === 'Fromdt');
    const daysItem = searchItems.find((item: any) => item.name === 'Days');

    const fromDateStr = Array.isArray(fromdtItem?.value_from)
      ? fromdtItem.value_from[0]
      : fromdtItem?.value_from;

    const days = Number(daysItem?.value_from);

    if (!fromDateStr || isNaN(days)) return;

    if (days > 70) {
      this.messageService.add({
        severity: 'error',
        summary: ERRMSG.E0017,
        sticky: true,
      });
      return;
    }

    const fromDate = new Date(fromDateStr);
    const dateColumns: any[] = [];
    const weekendColumns: {
      columnName: string;
      color: string;
      darkModeColor?: string;
      headerOnly?: boolean;
    }[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(fromDate);
      date.setDate(date.getDate() + i);

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');

      const name = `Date_${yyyy}${mm}${dd}`; // e.g., Date_20250618
      const displayName = `${mm}/${dd}`; // e.g., 06-18

      const day = date.getDay(); // 0 = Sunday, 6 = Saturday
      if (day === 0 || day === 6) {
        weekendColumns.push({
          columnName: name,
          color: day === 0 ? '#ffe0e0' : '#e0f7fa', // light mode
          darkModeColor: day === 0 ? '#3c1e1e' : '#1b2c2d', // dark mode
          headerOnly: true,
        });
      }

      dateColumns.push({
        name,
        displayName,
        dataType: '2',
        searchVisible: false,
        tableName: '',
        visible: true,
        frozen: false,
        width: '',
        isReferenceScreen: false,
      });
    }

    // Append generated date columns
    this.dataGrid = [...this.initielDataGrid, ...dateColumns];
    this.weekendColumnColor.set(weekendColumns);

    this.gridComponent.getData();
  }

  /**
   * Loader state is chnaged from child component
   * Child components will have single state of loader so they will pass boolean
   * @param isLoadingState
   */
  isLoadingChanged(isLoadingState: boolean): void {
    this.isLoading.update((n) => (isLoadingState ? n + 1 : Math.max(n - 1, 0)));
  }

  //to handle the event when Background Data being is loaded from GRID
  isBackGroundLoading(val: boolean) {
    this.isBackgroundOn.set(val);
  }
}
