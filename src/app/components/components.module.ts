import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PageHeaderComponent } from './page-header/page-header.component';

import { GoogleMapComponent } from './google-map/google-map.component';
import { ResultsTableComponent } from './results-table/results-table.component';
import { D3SvgComponent } from './d3-svg/d3-svg.component';
import { ShipmentTimelineComponent } from './shipment-timeline/shipment-timeline.component';
import { ResultsFilterComponent } from './results-filter/results-filter.component';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
  ],
  declarations: [
    PageHeaderComponent,
    GoogleMapComponent,
    ResultsTableComponent,
    D3SvgComponent,
    ShipmentTimelineComponent,
    ResultsFilterComponent,
  ],
  exports: [
    PageHeaderComponent,
    GoogleMapComponent,
    ResultsTableComponent,
    ResultsFilterComponent,
  ],
})
export class ComponentsModule { }
