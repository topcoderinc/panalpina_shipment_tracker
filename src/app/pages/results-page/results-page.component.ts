import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { ApiService } from '../../services/api.service';
import { ResultsTableComponent } from '../../components/results-table/results-table.component';
import { GoogleMapComponent } from '../../components/google-map/google-map.component';

// need to normalize strings in order to compare them
// will remove any non-word, non-digit character & lowercase the string
const normalize = str => str.replace(/[^a-z0-9]/ig, '').toLowerCase();

@Component({
  selector: 'app-results-page',
  templateUrl: './results-page.component.html',
  styleUrls: ['./results-page.component.scss']
})
export class ResultsPageComponent implements OnInit {
  state: any = {
    results: [],
    showFilters: false,

    // filters applied on the results
    filters: {
      shipmentNumber: [],
      shipmentType: ['air', 'ocean'],
      schedule: ['on-schedule', 'delayed'],
    },

    sort: 'eta',
  };

  public gMap: GoogleMapComponent;
  public resultsTable: ResultsTableComponent;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  /**
   * get route params & fetch results from API
   */
  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      if (!params.q) {
        return;
      }

      const values = params.q.split(',').map(s => s.trim()).filter(s => s);
      this.updateFilters({shipmentNumber: values});
    });
  }

  /**
   * Update the tracking numbers based on what user tiped in the search input
   */
  updateShipmentFilter($event) {
    this.updateFilters({
      shipmentNumber: $event.target.value.split(',').map(s => s.trim()).filter(s => s),
    });
  }

  /**
   * Remove the specified item from the results table
   */
  removeItem(item) {
    const shipmentNumber = normalize(item.shipmentNumber);
    const filters = this.state.filters.shipmentNumber || [];

    this.updateFilters({
      shipmentNumber: filters.filter(s => normalize(s) !== shipmentNumber),
    });
  }

  /**
   * Apply result filter & re-fetch the results from API
   */
  updateFilters(filters) {
    this.state.filters = {...this.state.filters, ...filters};
    this.fetchShipments();
  }

  updateSort(sort) {
    this.state.sort = sort;
    this.fetchShipments();
  }

  fetchShipments() {
    this.api.getTrackingResults(this.state.filters, this.state.sort)
      .subscribe(results => this.state.results = results);
  }
}
