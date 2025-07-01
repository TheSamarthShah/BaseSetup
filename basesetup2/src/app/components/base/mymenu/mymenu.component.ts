import { Component } from '@angular/core';
import { C101, C105, COMMON, D101 } from '../../../shared/jp-text';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mymenu',
  imports: [RouterModule],
  templateUrl: './mymenu.component.html',
  styleUrl: './mymenu.component.scss',
})
export class MymenuComponent {
  formTitle: string = COMMON.MYFAVORITES;
  c101Title: string = C101.FORM_TITLE;
  c105Title: string = C105.FORM_TITLE;
  d101Title: string = D101.FORM_TITLE;
}
