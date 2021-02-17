import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CovidService } from './covid.service';

@Injectable({
  providedIn: 'root'
})
export class CountryPagesGuard implements CanActivate {
  constructor(private covidService: CovidService, 
    private router: Router) {};

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (!this.covidService.onCountry()){
        this.router.navigate(["homepage"])
      } else {
        localStorage.removeItem("country")
      }
    return true;
  }
  
}