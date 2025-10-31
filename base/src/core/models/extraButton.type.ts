export type EXTRA_BTN = {
  type:
    | 'outlined'
    | 'filled'
    | 'icon'
    | 'mini fab'
    | 'text'
    | 'split-outlined'
    | 'split-filled'
    | 'menu-outlined'
    | 'menu-filled'
    | 'toggle';
  disabled?: boolean;
  IsVisible?: boolean;
  text: string;
  leftIcon?: string;
  rightIcon?: string;
  btnClass?: string;
  severity?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'help'
    | 'danger'
    | undefined;
  menuModel?: any[];
 
  state?: 'active' | 'inactive';
  inactiveText?: string;
  activeText?: string | null;
  inactiveLeftIcon?: string | undefined;
  activeLeftIcon?: string | undefined;
  inactiveRightIcon?: string | undefined;
  activeRightIcon?: string | undefined;
  activeBtnClass?: string | undefined;
  inactiveBtnClass?: string | undefined;
 
  onBtnClick?: (e: any) => void;
  onMenuBtnClick?: (item: { id: string; label: string; icon?: string }) => void;
};