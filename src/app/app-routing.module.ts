import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrackingPageComponent } from './pages/tracking-page/tracking-page.component';
import { ResultsPageComponent } from './pages/results-page/results-page.component';

const routes: Routes = [
  {path: '', component: TrackingPageComponent},
  {path: 'results', component: ResultsPageComponent},
  // redirect any 404 to root page
  {path: '**', redirectTo: '/'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
