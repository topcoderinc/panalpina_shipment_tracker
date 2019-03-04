import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isString, forEach, isNil } from 'lodash';
import { environment } from 'src/environments/environment';

const API_BASE_URL = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class HttpHelperService {

  constructor(private http: HttpClient) { }

  /**
 * Performs a request with `get` http method.
 * @param url the url
 * @param options the request options
 */
  get(url: string, options?: any): Observable<any> {
    return this.http
      .get(API_BASE_URL + url, this.requestOptions(options));
  }

  /**
   * Request options.
   * @param options the request options
   */
  private requestOptions(options?: any): any {
    if (options == null) {
      options = {};
    }

    if (options.headers == null) {
      options.headers = new HttpHeaders();
    }

    if (options.params != null) {
      if (!isString(options.params)) {
        forEach(options.params, (value, key) => {
          if (isNil(value) || (isString(value) && value.length === 0)) {
            delete options.params[key];
          }
        });
      }
    }
    return options;
  }
}
