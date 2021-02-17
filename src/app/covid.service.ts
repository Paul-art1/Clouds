import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { globalData } from './globalData.model';


@Injectable({
  providedIn: 'root'
})
export class CovidService {

  constructor(private afAuth: AngularFireAuth, private router: Router,
    private firestore: AngularFirestore, private httpClient: HttpClient) { }

  openCountry(country: String) {
    localStorage.setItem("country", JSON.stringify(country));
    this.router.navigate([country])
  }

  onCountry(): boolean {
    return JSON.parse(localStorage.getItem("country")) != null;
  }

  backToHomepage() {
    localStorage.removeItem("country");
    this.router.navigate(["homepage"]);
  }

  getSummary(country: string) {
    return this.firestore.collection("country")
      .doc(country).collection("summary").doc("summary").valueChanges();
  }

  updateSummary(country: string, summary: globalData) {
    this.firestore.collection("country").doc(country).collection("summary").doc("summary").set(summary, { merge: true });
  }

}
