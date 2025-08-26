import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Navbar } from "../navbar/navbar";
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule} from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MATERIAL_MENU_DATA, MaterialMenuNode } from '../../../shared/menu-list';

interface TreeNode {
  name: string;
  icon: string;
  path?: string;
  children?: TreeNode[];
}

interface FlatNode {
  name: string;
  icon: string;
  path?: string;
  level: number;
  expandable: boolean;
}


@Component({
  selector: 'layout',
  imports: [MatSidenavModule,
    MatIconModule,
    RouterOutlet,
    MatTreeModule,
    CommonModule,
    Navbar, RouterLink],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
 sidenavOpened = true;
  toggleSidenav(state: any) {
    this.sidenavOpened = state;
  }

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener<MaterialMenuNode, FlatNode>(
    (node, level) => ({
      name: node.name,
      icon: node.icon || '',
      routerLink: node.routerLink,
      expandable: !!node.children && node.children.length > 0,
      level
    }),
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.dataSource.data = MATERIAL_MENU_DATA;
  }

  hasChildren = (_: number, node: FlatNode) => node.expandable;
  hasNoChildren = (_: number, node: FlatNode) => !node.expandable;
}
