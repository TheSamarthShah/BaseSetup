import { ButtonSeverity } from 'primeng/button';

export type ActyDialogData = {
  message: string; // message to show in body
  header?: string; // header text for dialog
  buttons?: DialogButton[]; // array of buttons
};

export type DialogButton = {
  label: string; // button label
  severity?: ButtonSeverity; // classes for style of button
  callback?: () => void; // call back function when button clicked
};
