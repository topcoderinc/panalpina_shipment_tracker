import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-results-filter',
  templateUrl: './results-filter.component.html',
  styleUrls: ['./results-filter.component.scss']
})
export class ResultsFilterComponent {
  @Input() filters: any = {};
  @Output() filtersChange = new EventEmitter<any>();

  @Input() sort = 'eta';
  @Output() sortChange = new EventEmitter<any>();

  sortOptions = [
    {value: 'eta', label: 'Time of arrival'},
    {value: 'shipmentType', label: 'Shipment type'},
    {value: 'status', label: 'Status'},
  ];

  /**
   * Check if item is active
   */
  isActive(category, filter) {
    return this.filters[category].indexOf(filter) > -1;
  }

  /**
   * Toggle the specified filter & emit a change event
   */
  applyFilter(category, filter) {
    const isActive = this.isActive(category, filter);

    const filters = this.filters[category].slice();
    if (isActive) {
      const i = filters.indexOf(filter);
      filters.splice(i, 1);
    } else {
      filters.push(filter);
    }

    this.filtersChange.emit({...this.filters, [category]: filters});
  }

  /**
   * Change the sorting method
   */
  changeSort() {
    this.sortChange.emit(this.sort);
  }
}
