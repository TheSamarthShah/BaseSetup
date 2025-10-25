import { Component } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'login',
  imports: [MatFormField, MatCardModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

}
