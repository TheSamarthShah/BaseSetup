
export interface MaterialMenuNode {
  name: string;
  icon?: string;
  routerLink?: string[];
  children?: MaterialMenuNode[];
}

export const MATERIAL_MENU_DATA: MaterialMenuNode[] = [
  {
    name: 'Grid',
    routerLink: ['/griddemo']
  },
  {
    name: 'Button',
    routerLink: ['/buttondemo']
  },
  {
    name: 'FileUpload',
    routerLink: ['/fileuploaddemo']
  },
  {
    name: 'MultiSelect',
    routerLink: ['/multiselectdemo']
  },
];
