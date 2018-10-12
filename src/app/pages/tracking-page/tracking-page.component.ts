import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-tracking-page',
  templateUrl: './tracking-page.component.html',
  styleUrls: ['./tracking-page.component.scss']
})
export class TrackingPageComponent implements OnInit {
  @ViewChild('input') inputEl: ElementRef;

  filter: any = {};

  referenceOptions: any = [
    'Auto Detect Reference',
    'House AWB Number',
    'Direct AWB Number',
    'House Bill of Landing',
    'Overland',
    'Customer Reference',
    'Container Number'
  ];

  // default value for the reference dropdown
  public reference = 'Auto Detect Reference';

  private input = new Subject<any>();

  public trackingNumbers: any = [];

  // get current search query - used to pass as parameter to the results page
  get searchQuery() {
    return this.trackingNumbers.map(n => n.number).join(',');
  }

  constructor(private api: ApiService) {}

  ngOnInit() {
    const input = this.inputEl.nativeElement;

    // debounce user input & add the numbers to the tracking list
    // clear the input once the numbers were added
    this.input
      .debounceTime(750)
      .subscribe(data => (this.addTrackingNumbers(data), input.value = ''));
  }

  /**
   * Split user input by comma & map it to an object containing the number & the type
   */
  mapInput(input) {
    const index = this.referenceOptions.indexOf(this.reference);
    const values = input.split(',').map(s => s.trim()).filter(s => s);

    return values.map(number => ({
      number,
      type: index,
    }));
  }

  /**
   * Handle the keyup event
   */
  onInputUpdate(value) {
    this.input.next( this.mapInput(value) );
  }

  /**
   * Show the user-added numbers
   */
  addTrackingNumbers(items) {
    items.forEach(item => {
      if (item.type > 0) {
        this.trackingNumbers.push({
          ...item,
          type: this.referenceOptions[item.type],
        });

        return;
      }

      // if the number was added on "auto-detect", call the api to decide
      // which type this number should be
      this.trackingNumbers.push(item);
      this.api.getReferenceType(item.number)
        .subscribe(d => item.type = d);
    });
  }

  /**
   * Remove the number from the tracking list
   */
  remove(item) {
    const index = this.trackingNumbers.indexOf(item);
    this.trackingNumbers.splice(index, 1);
  }
}
