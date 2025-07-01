import { MenuItem } from 'primeng/api';
import {
  A0015U,
  MITEM0010I,
  MITEM0010U,
  MITEM0011U,
  A103,
  A104,
  A105,
  D101,
  C101,
  C105,
  D204,
  D104,
  B110,
  F101,
  C110,
  COMMON,
  F102,
} from './jp-text';

export const MENU: MenuItem[] = [
  {
    label: 'ホーム',
    items: [{ label: COMMON.MYFAVORITES, routerLink: ['/'] }],
  },
  // {
  //   label: '受注管理',
  //   items: [
  //     { label: MITEM0010I.FORM_TITLE, routerLink: ['/mitem0010i'] },
  //     { label: MITEM0010U.FORM_TITLE, routerLink: ['/mitem0010u'] },
  //     { label: MITEM0011U.FORM_TITLE, routerLink: ['/mitem0011u'] },
  //     { label: A0015U.FORM_TITLE, routerLink: ['/a0015u'] },
  //   ],
  // },
  {
    label: 'マスタ参照',
    items: [
      { label: A103.FORM_TITLE, routerLink: ['/a103'] },
      { label: A104.FORM_TITLE, routerLink: ['/a104'] },
      { label: A105.FORM_TITLE, routerLink: ['/a105'] },
    ],
  },
  {
    label: '計画',
    items: [{ label: B110.FORM_TITLE, routerLink: ['/b110'] }],
  },
  {
    label: '指示',
    items: [
      { label: C101.FORM_TITLE, routerLink: ['/c101'] },
      { label: C105.FORM_TITLE, routerLink: ['/c105'] },
      { label: C110.FORM_TITLE, routerLink: ['/c110'] },
    ],
  },
  {
    label: '製造',
    items: [
      { label: D101.FORM_TITLE, routerLink: ['/d101'] },
      { label: D104.FORM_TITLE, routerLink: ['/d104'] },
      { label: D204.FORM_TITLE, routerLink: ['/d204'] },
    ],
  },
  {
    label: '在庫',
    items: [
      { label: F101.FORM_TITLE, routerLink: ['/f101'] },
      { label: F102.FORM_TITLE, routerLink: ['/f102'] },
    ],
  },
];
