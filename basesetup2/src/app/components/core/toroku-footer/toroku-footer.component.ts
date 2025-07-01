import { signal, inject, Input, input, Component, output } from '@angular/core';
import { Location } from '@angular/common';
import { SplitButtonModule } from 'primeng/splitbutton';
import { FormStateService } from '../../../services/base/form-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataChangeDetectedService } from '../../../services/core/data-change-detected.service';
import { MenuItem } from 'primeng/api';
import { changesReturn } from '../../../model/shared/confirm-changes-guard-props.type';
import { TOROKU } from '../../../shared/jp-text';
import { ButtonModule } from 'primeng/button';
import { GRID_BTN } from '../../../model/core/grid.type';

@Component({
  selector: 'app-toroku-footer',
  imports: [SplitButtonModule, ButtonModule],
  templateUrl: './toroku-footer.component.html',
  styleUrl: './toroku-footer.component.scss',
})
export class TorokuFooterComponent {
  //inject dependencies
  DataChangeDetected = inject(DataChangeDetectedService);
  formStateService = inject(FormStateService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  location = inject(Location);

  //inputs
  currPageURL = input.required<string>();
  currMode = input.required<number>();
  currPkData = input.required<{ [key: string]: any } | null>();
  extraBtnsList = input<GRID_BTN[]>();
  @Input() modeChangeValidation!: () => boolean;
  @Input() changeDetectAlert!: () => Promise<changesReturn>;

  //outputs
  handleModeChange = output<number>();
  handleBack = output<void>();
  handleUpdate = output<void>();
  handleAdd = output<void>();
  handleDelete = output<void>();
  handleReset = output<void>();
  handleRequiredClassRemove = output<void>();

  textContent = TOROKU;
  //New mode screen option to open in new tab or new window
  torokuOpenWith_0: MenuItem[] = [
    {
      label: this.textContent.OPEN_TAB,
      command: () => this.navigateWithEncodedMode(1, 'tab'), // new tab
    },
    { separator: true },
    {
      label: this.textContent.OPEN_WINDOW,
      command: () => this.navigateWithEncodedMode(1, 'window'), // new window
    },
  ];
  //Edit mode screen option to open in new tab or new window
  torokuOpenWith_1: MenuItem[] = [
    {
      label: this.textContent.OPEN_TAB,
      command: () => this.navigateWithEncodedMode(2, 'tab'), // new tab
    },
    { separator: true },
    {
      label: this.textContent.OPEN_WINDOW,
      command: () => this.navigateWithEncodedMode(2, 'window'), // new window
    },
  ];

  //Copy screen option to open in new tab or new window
  torokuOpenWith_2: MenuItem[] = [
    {
      label: this.textContent.OPEN_TAB,
      command: () => this.navigateWithEncodedMode(5, 'tab'), // new tab
    },
    { separator: true },
    {
      label: this.textContent.OPEN_WINDOW,
      command: () => this.navigateWithEncodedMode(5, 'window'), // new window
    },
  ];

  //This function is for the navigation to open in new windows, new tab and same window
  navigateWithEncodedMode(
    mode: number,
    targetType: 'same' | 'tab' | 'window' = 'same'
  ): void {
    let pkData = mode !== 1 ? JSON.stringify(this.currPkData()) : null;
    const encoded = btoa(`mode=${mode}&pkData=${pkData}`);

    //when edit mode to copy mode then check the primary key is enter or not
    if (this.currMode() === 2 && mode === 5) {
      const result = this.modeChangeValidation();
      if (result === false) {
        return;
      } else {
        pkData = JSON.stringify(this.currPkData());
      }
    }

    const urlTree = this.router.createUrlTree([this.currPageURL()], {
      queryParams: { key: encoded },
    });

    const baseHref = (
      document.getElementsByTagName('base')[0]?.href || window.location.origin
    ).replace(/\/$/, ''); // remove tailing backslash
    const fullUrl = baseHref + this.router.serializeUrl(urlTree);

    if (targetType === 'tab') {
      window.open(fullUrl, '_blank'); // Opens in a new tab
    } else if (targetType === 'window') {
      window.open(fullUrl, '_blank', 'width=1400,height=700'); // Opens in a new window with custom size
    } else {
      this.router.navigateByUrl(urlTree); // Same tab navigation
    }
  }

  // This function is use for the change the mode
  async toggleMode(mode: number): Promise<void> {
    //If the reference and new mode no need to check change detection
    if (this.currMode() != 0) {
      const result = await this.changeDetectAlert();
      if (result.proceed === false) {
        return;
      }
    }

    let pkData = mode !== 1 ? JSON.stringify(this.currPkData()) : null;
    //when edit mode to copy mode then check the primary key is enter or not
    if (this.currMode() === 2 && mode === 5) {
      const result = this.modeChangeValidation();
      if (result === false) {
        return;
      } else {
        pkData = JSON.stringify(this.currPkData());
      }
    }

    //if copy mode to move edit mode that time reset data
    if (this.currMode() === 5 && mode === 2) {
      pkData = null;
    }

    this.modeSet(mode);
    //when mode change that time remove the edited and required class
    this.editedRequiredClassRemove();
    this.resetDataCheck();
    this.DataChangeDetected.dataChangeListReset();
    this.DataChangeDetected.netRowChangeCounterReset();
    const encoded = btoa(`mode=${mode}&pkData=${pkData}`);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { key: encoded },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // This function is used to go back to previous screen
  goBack(): void {
    if (this.formStateService.torokuModoruFormId() != '') {
      this.formStateService.torokuModoru.set(true);
    }

    this.location.back();
  }

  //This function is for the event emitter for update data
  updateData(): void {
    this.handleUpdate.emit();
  }

  //This function is for the event emitter for add data
  addData(): void {
    this.handleAdd.emit();
  }

  //This function is for the event emitter for delete confirmation
  deleteConfirmation(): void {
    this.handleDelete.emit();
  }

  //This function is for the event emitter for reset data
  resetDataCheck(): void {
    this.handleReset.emit();
  }

  //This function is for the emitter when the mode change then remove the edited required class
  editedRequiredClassRemove(): void {
    this.handleRequiredClassRemove.emit();
  }

  //This function is for the event emitter for mode set
  modeSet(mode: number): void {
    this.handleModeChange.emit(mode);
  }
}
