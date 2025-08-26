import { Component } from '@angular/core';
import { Multiselect, MultiselectOption } from '../../../../core/components/multiselect/multiselect';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'multiselect-demo',
  imports: [Multiselect, CommonModule],
  templateUrl: './multiselect-demo.html',
  styleUrl: './multiselect-demo.scss'
})
export class MultiselectDemo {
  myOptions: MultiselectOption[] = [
  { key: '1', label: 'Electronics' },
  { key: '2', label: 'Clothing' },
  { key: '3', label: 'Books' },
  { key: '4', label: 'Groceries' },
  { key: '5', label: 'Home & Garden' },
  { key: '6', label: 'Sports & Outdoors' },
  { key: '7', label: 'Toys & Games' },
  { key: '8', label: 'Health & Beauty' },
  { key: '9', label: 'Automotive' },
  { key: '10', label: 'Food & Drink' },
  { key: '11', label: 'Music' },
  { key: '12', label: 'Movies & TV' },
  { key: '13', label: 'Pet Supplies' },
  { key: '14', label: 'Jewelry' },
  { key: '15', label: 'Art & Crafts' },
];

  selectedCategories: string = '';

  ngOnInit(): void {
    this.selectedCategories = '1,4';
  }
}
