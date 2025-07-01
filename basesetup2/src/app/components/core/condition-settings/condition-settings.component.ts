import { Component, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { AutomaticAdjustmentComponent } from '../automatic-adjustment/automatic-adjustment.component';
import {
  FILTER_TEXT,
  AUTOMATIC_HEIGHT_ADJUSTMENT,
  CONDITION_SETTING_DISP,
} from '../../../shared/jp-text';
import { FILTER } from '../../../model/core/filter.type';
import { DisplayConditionSettingsComponent } from '../display-condition-settings/display-condition-settings.component';

@Component({
  selector: 'app-condition-settings',
  imports: [
    CommonModule,
    MenuModule,
    ButtonModule,
    AutomaticAdjustmentComponent,
    DisplayConditionSettingsComponent,
  ],
  templateUrl: './condition-settings.component.html',
  styleUrl: './condition-settings.component.scss',
})
export class ConditionSettingsComponent implements OnInit {
  formID = input.required<string>();
  //list of columns received from parent component
  searchCols = input<Array<FILTER>>([]);
  isBackGroundOn = input<boolean>();
  showDisplayConditionSetting = input.required<boolean>();
  showAutomaticAdjustment = input.required<boolean>();

  conditionAdjustmentKBNOut = output<string>();
  loadTriggered = output<Array<FILTER>>();
  getDataTrigger = output<boolean>();

  //for displaying text
  filterTextContent: string = FILTER_TEXT.COND_SET_BTN;
  conditionDisplayTextContent: string = CONDITION_SETTING_DISP.TITLE;
  automaticAdjustmentTextContent: string = AUTOMATIC_HEIGHT_ADJUSTMENT.TITLE;
  //list of all the avaialble menus
  childMenuItems: MenuItem[] = [];

  conditionAdjustmentKBN = signal<string>('');
  //flag to maintain visibility of 条件設定表示 dialog
  cond_set_disp = signal<boolean>(false);
  //flag to maintain visibility of 自動調整表示 dialog
  cond_set_disp_adjustment = signal<boolean>(false);
  childComponent = signal('');

  ngOnInit(): void {
    //set the text content for the menu items after the component is initialized
    this.childMenuItems = [
      {
        escape: false,
        label: this.conditionDisplayTextContent,
        icon: 'pi pi-wrench',
        command: async () => {
          this.childComponent.set('1');
          this.cond_set_disp.set(true);
        },
        visible: this.showDisplayConditionSetting(),
      },
      {
        escape: false,
        label: this.automaticAdjustmentTextContent,
        icon: 'pi pi-arrows-v',
        command: () => {
          this.childComponent.set('2');
          this.cond_set_disp_adjustment.set(true); // Open the dialog
        },
        visible: this.showAutomaticAdjustment(),
      },
    ];
  }

  /**
   * when DisplayConditionSettingsComponent is closed
   */
  conditionSettingDisplayClosed(): void {
    this.cond_set_disp.set(false);
  }
  /**
   * when search columns data is emitted form DisplayConditionSettingsComponent pass it down
   * @param searchCols
   */
  conditionSettingLoad(searchCols: Array<FILTER>): void {
    this.conditionSettingDisplayClosed();
    this.loadTriggered.emit(searchCols);
  }
  /**
   * when AutomaticAdjustmentComponent component is closed
   */
  automaticAdjustmentClosed(): void {
    this.cond_set_disp_adjustment.set(false);
  }
  /**
   * when adjustmentKBN is changed pass it down
   * @param adjustmentKBN
   */
  conditionAdjustmentKBNChanged(adjustmentKBN: string): void {
    this.conditionAdjustmentKBN.set(adjustmentKBN);
    this.conditionAdjustmentKBNOut.emit(adjustmentKBN);
  }
}
