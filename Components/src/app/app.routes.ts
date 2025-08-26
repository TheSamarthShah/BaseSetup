import { Routes } from '@angular/router';
import { GridDemo } from './components/pages/grid-demo/grid-demo';
import { Layout } from './components/base/layout/layout';
import { ButtonDemo } from './components/pages/button-demo/button-demo';
import { FileuploadDemo } from './components/pages/fileupload-demo/fileupload-demo';
import { MultiselectDemo } from './components/pages/multiselect-demo/multiselect-demo';

export const routes: Routes = [
  // Routes WITH navigation (rendered inside LayoutComponent)
  {
    path: '',
    component: Layout,
    children: [
      { path: 'griddemo', component: GridDemo },
      { path: 'buttondemo', component: ButtonDemo },
      { path: 'fileuploaddemo', component: FileuploadDemo },
      { path: 'multiselectdemo', component: MultiselectDemo },
      { path: '', redirectTo: 'griddemo', pathMatch: 'full' },
    ],
  },
];
