import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomepageComponent } from './homepage/homepage.component';
import { CountrypageComponent } from './countrypage/countrypage.component';

import { CountryPagesGuard } from './countrypages.guard';

const routes: Routes = [
  { path : "homepage", component : HomepageComponent },
  { path : "", pathMatch: "full", redirectTo: "homepage"},
  { path : "**", component: CountrypageComponent, canActivate: [CountryPagesGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
