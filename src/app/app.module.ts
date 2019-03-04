import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';
import { TrackingPageComponent } from './pages/tracking-page/tracking-page.component';
import { ResultsPageComponent } from './pages/results-page/results-page.component';


import { GMapsLoader } from './services/gmaps-loader.service';
import { DropdownDirective } from './directives/dropdown.directive';

@NgModule({
  declarations: [
    AppComponent,
    TrackingPageComponent,
    ResultsPageComponent,
    DropdownDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ComponentsModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [
    GMapsLoader
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
