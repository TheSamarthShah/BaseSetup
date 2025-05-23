export type DialogButton = {
    label: string;
    icon?: string;
    styleClass?: string;
    callback?: () => void;
    type?: 'primary' | 'secondary' | 'danger' | 'custom';
    disabled?: boolean;
  }
  
  export type DialogType = 'confirm' | 'error' | 'info' | 'success';
  
  export type ActyDialogData = {
    header?: string;               // Dialog title/header
    message?: string;              // Text message to display
    htmlContent?: string;          // Optional HTML message content
    type?: DialogType;             // Controls icon (e.g., confirm, error, etc.)
    buttons?: DialogButton[];      // Array of action buttons
    closable?: boolean;            // Can be closed via 'x' or outside click
    width?: string;                // e.g., '400px', '50%'
    height?: string;               // e.g., '300px'
    styleClass?: string;           // Custom CSS for p-dialog
  }
  