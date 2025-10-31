export class DialogButton {
  constructor(
    public text: string,
    public type: 'outlined' | 'filled' | 'icon' | 'mini fab' | 'text' = 'filled',
    public severity: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | undefined = 'primary',
    public leftIcon?: string,
    public rightIcon?: string,
    public btnClass?: string,
    public disabled: boolean = false
  ) {}
}