import { Component, inject } from '@angular/core';
import { Splitbutton } from '../../../../core/components/splitbutton/splitbutton';
import { Button } from '../../../../core/components/button/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'button-demo',
  imports: [Button, Splitbutton, MatCardModule, MatGridListModule],
  templateUrl: './button-demo.html',
  styleUrl: './button-demo.scss'
})
export class ButtonDemo {
  private _snackBar = inject(MatSnackBar);

  btnClick(){
    this.openSnackBar('Button Clicked!!!');
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  onSave() {
  this.openSnackBar('Save Clicked!!!');
}

onMenuAction(item: { label: string }) {
  this.openSnackBar(item.label + ' Clicked!!!');
}
}
