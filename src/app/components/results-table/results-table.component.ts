import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-results-table',
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.scss'],
  exportAs: 'table',
})
export class ResultsTableComponent {
  state: any = {
    selected: null,
    details: false,
    timeline: false,
  };

  @Input() data = [];

  @Output() selectedChange = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();

  constructor(private cd: ChangeDetectorRef) { }

  /**
   * Only select a route (highlight it on the map) - don't show the details section
   */
  select(item) {
    if (item.shipmentNumber !== this.state.selected) {
      this.state = {selected: null};
    }

    this.selectedChange.emit(item);
  }

  /**
   * Show details section for specified route
   * If the route is already selected, hide the details view
   */
  showDetails(shipmentNumber) {
    const item = this.data.find(i => i.shipmentNumber === shipmentNumber);

    if (this.isActive(item, 'details')) {
      this.state = {selected: null};
      this.selectedChange.emit(null);
    } else {
      this.toggleView(item, 'details');
    }

    // this is called outside of angular's scope,
    // we need to trigger the detection to update the view
    this.cd.detectChanges();
  }

  /**
   * Show the specified detailed view for the passed item
   * If one item is already active, hide both it's sections before showing a new item
   */
  toggleView(item, view) {
    const no = item.shipmentNumber;

    if (this.state.selected !== no) {
      this.state = {
        selected: no,
        [view]: true,
      };
    } else {
      this.state[view] = !this.state[view];
    }

    // trigger a change event which will highlight the route on the map
    const isActive = this.state.details || this.state.timeline;
    this.selectedChange.emit(isActive ? item : null);
  }

  /**
   * Check if the specified detailed view for the passed item is active
   */
  isActive(item, view) {
    const no = item.shipmentNumber;
    return this.state.selected === no && this.state[view];
  }

  /**
   * Remove route from view
   */
  removeItem(item) {
    this.remove.emit(item);
  }
}
