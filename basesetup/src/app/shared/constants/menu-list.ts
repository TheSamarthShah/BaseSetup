import { JPTEXT } from '../../shared/constants/jp-text';

export type MenuItem = {
  label: string;
  icon?: string;
  routerLink?: string;
  items?: MenuItem[];
};

export const menuItems: MenuItem[] = [
  {
    label: '受注管理',
    icon: '',
    items: [
      {
        label: JPTEXT.MITEM0010I.FORM_TITLE,
        icon: 'bi bi-binoculars-fill',
        routerLink: '/mitem0010i',
      },
      {
        label: JPTEXT.MITEM0010U.FORM_TITLE,
        icon: 'bi bi-database-fill-gear',
        routerLink: '/mitem0010u',
      },
      {
        label: JPTEXT.MITEM0011U.FORM_TITLE,
        icon: 'bi bi-database-fill-gear',
        routerLink: '/mitem0011u',
      },
    ],
  },
  {
    label: '出荷管理',
    icon: '',
    items: [
      {
        label: '出荷引当入力',
        icon: 'bi bi-database-fill-gear',
        routerLink: '',
      },
      {
        label: '検言成績依頼一覧',
        icon: 'bi bi-database-fill-gear',
        routerLink: '',
      },
      { label: '出荷一覧', icon: 'bi bi-binoculars-fill', routerLink: '' },

      { label: '出荷入力', icon: 'bi bi-database-fill-gear', routerLink: '' },
      { label: '出荷ラベル', icon: 'bi bi-printer-fill', routerLink: '' },
      { label: '出荷指示リスト', icon: 'bi bi-printer-fill', routerLink: '' },
      { label: '納品書・受領書', icon: 'bi bi-printer-fill', routerLink: '' },
    ],
  },
  {
    label: '生産管理',
    icon: '',
    items: [
      { label: '所要展開', icon: 'bi bi-database-fill-gear', routerLink: '' },
      {
        label: '整合チェック照会',
        icon: 'bi bi-binoculars-fill',
        routerLink: '',
      },
      {
        label: '現品識別票生産管理チェック',
        icon: 'bi bi-database-fill-gear',
        routerLink: '',
      },
      {
        label: 'KIT/SET 引当状況問い合わせ',
        icon: 'bi bi-binoculars-fill',
        routerLink: '',
      },
    ],
  },
  {
    label: '製造管理',
    icon: '',
    items: [
      {
        label: '製造予定・指示一覧',
        icon: 'bi bi-binoculars-fill',
        routerLink: '',
      },
      {
        label: '製造予定・指示入力',
        icon: 'bi bi-database-fill-gear',
        routerLink: '',
      },
      {
        label: '製造予定確定入力',
        icon: 'bi bi-database-fill-gear',
        routerLink: '',
      },
      {
        label: '製造指示内容品証チェック',
        icon: 'bi bi-binoculars-fill',
        routerLink: '',
      },

      { label: '現品識別票', icon: 'bi bi-printer-fill', routerLink: '' },
      {
        label: '工事分割入力',
        icon: 'bi bi-database-fill-gear',
        routerLink: '',
      },
      {
        label: '作業停止・解除',
        icon: 'bi bi-binoculars-fill',
        routerLink: '',
      },
      { label: '製品識別ラベル', icon: 'bi bi-printer-fill', routerLink: '' },
    ],
  },
];
