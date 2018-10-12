import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from '../../environments/environment';

const {BASE_URL, FORMAT} = environment.api;

// escape string and prepare for regex
const escapeRegExp = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// add a matching expresion for whitespaces between word & digit characters
const addWhiteSpaceMatch = text => text.replace(/(\w)(\d)/, '$1[-_\\ +]*$2');

// filter the results from json, based on the passed filters (eg. shipmentNumber, shipmentType)
// this function should be removed once the backend integration is done, it serves only as demo
const filter = (filters) => (items) => {
  return Object.keys(filters).reduce((results, key) => {
    if (!filters[key] || !filters[key].length) {
      return [];
    }

    const query = RegExp(filters[key].map(escapeRegExp).map(addWhiteSpaceMatch).join('|'), 'i');
    return results.filter(r => r[key].match(query));
  }, items);
};

// sort the results from json, based on the passed criteria
// this function should be removed once the backend integration is done, it serves only as demo
const sort = (sortBy) => (items) => (
  items.sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1));

@Injectable()
export class ApiService {

  constructor(private http: HttpClient) {}

  /**
   * fetch Basic fetch function
   * @param path    Path to fetch from
   * @param options Options for the call
   */
  fetch(path, options?) {
    const url = `${BASE_URL}${path}${FORMAT}`;
    return this.http.get(url, options)
      // cast the result object to <any>
      .map((data: any) => data)

      // handle network errors
      .catch((error) => (
        console.error(`Couldn't fetch data from ${url}`, error), []));
  }

  /**
   * getTrackingResults Get entities for the passed in filters
   * @param filters Filter the shipment routes
   * @param sortBy Pass a property to sort the routes by
   */
  getTrackingResults(filters, sortBy) {
    return this.fetch('/results').map(filter(filters)).map(sort(sortBy));
  }

  /**
   * getReferenceType Get the reference type for the passed tracking number
   * @param ref The tracking number reference
   */
  getReferenceType(ref) {
    return this.fetch('/types').map(response => Object.keys(response).find(type => (
      response[type].indexOf(ref) > -1)));
  }
}
