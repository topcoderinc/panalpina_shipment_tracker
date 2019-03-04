import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { ResultsTableComponent } from '../../components/results-table/results-table.component';
import { GoogleMapComponent } from '../../components/google-map/google-map.component';
import * as _ from 'lodash';
import { TrackingService } from 'src/app/services/tracking.service';
import { forkJoin, merge, of } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import { Location } from '@angular/common';

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

  tempData = null;

  public gMap: GoogleMapComponent;
  public resultsTable: ResultsTableComponent;

  constructor(private trackingSvc: TrackingService,
    private route: ActivatedRoute, private location: Location) { }

  /**
   * get route params & fetch results from API
   */
  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      if (!params.q) {
        return;
      }
      const values = params.q.split(',').map(s => s.trim()).filter(s => s);
      this.updateFilters({ shipmentNumber: values }, true);
    });
  }

  /**
   * Update the tracking numbers based on what user tiped in the search input
   * @param value the value
   */
  updateShipmentFilter(value) {
    this.updateFilters({
      shipmentNumber: value.split(',').map(s => s.trim()).filter(s => s)
    }, true);
    this.location.go(`/results?q=${value.split(',').map(s => s.trim()).join(',')}`);
  }

  /**
   * Remove the specified item from the results table
   * @param item the item
   */
  removeItem(item) {
    const shipmentNumber = normalize(item.shipmentNumber);
    this.state.results = this.state.results.filter(x => normalize(x.shipmentNumber) !== shipmentNumber);
    this.tempData = this.state.results;
  }

  /**
   * Apply result filter & re-fetch the results from API
   * @param filters the filter
   * @param isInit if init or not
   */
  updateFilters(filters, isInit = false) {
    this.state.filters = { ...this.state.filters, ...filters };
    if (isInit) {
      this.fetchShipments();
    } else {
      this.trackingSvc.filterResults(this.tempData, this.state.filters, this.state.sort).subscribe(res => {
        this.state.results = res;
      });
    }
  }

  /**
   * updates the sort
   * @param sort the sort
   */
  updateSort(sort) {
    this.state.sort = sort;
    this.trackingSvc.filterResults(this.tempData, this.state.filters, this.state.sort).subscribe(res => {
      this.state.results = res;
    });
  }

  /**
   * fetch shipments
   */
  fetchShipments() {
    const observables = [];
    _.each(this.state.filters.shipmentNumber, (shipmentNumber) => {
      // catch error and return null so that some of them can be run well
      observables.push(this.trackingSvc.getShipmentType(shipmentNumber).pipe(mergeMap(res => {
        // check the shipment type
        if (res.type === 'air') {
          return this.trackingSvc.getFlightDetails(shipmentNumber).pipe(catchError(error => of(null)));
        } else if (res.type === 'ocean') {
          return this.trackingSvc.getFreightDetails(shipmentNumber).pipe(catchError(error => of(null)));
        }
      })).pipe(catchError(error => of(null))));
    });
    forkJoin(observables).subscribe(results => {
      this.trackingSvc.filterResults(_.filter(results, i => i), this.state.filters, this.state.sort).subscribe(res => {
        this.state.results = res;
        this.tempData = this.state.results;
      });
    }, err => {
      this.state.results = [];
      this.tempData = [];
    });
  }
}
