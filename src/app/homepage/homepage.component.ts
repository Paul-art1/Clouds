import { Component, OnInit } from '@angular/core';
import { CovidService } from '../covid.service';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import { globalData } from '../globalData.model';
import { dailyData } from '../dailyData.model';
import * as moment from 'moment';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})

export class HomepageComponent implements OnInit {

  dBar: string[];
  chart1data$: globalData;
  chart4data$: globalData[];
  chart2data$: dailyData[];
  chart3data$: dailyData[];
  PChart = [];
  BarChart = [];
  activeCases: number;
  recoveryRate: string;
  mortalityRate: string;
  country = 1;
  newConf = -1;
  totalConf = -1;
  newReco = -1;
  totalReco = -1;
  newDeat = -1;
  totalDeat = -1;

  ArrowsH_id = ["country_H", "newCases_H", "totCases_H", "newRec_H", "totRec_H", "newDeath_H", "totDeath_H"];
  ArrowsB_id = ["country_B", "newCases_B", "totCases_B", "newRec_B", "totRec_B", "newDeath_B", "totDeath_B"];

  constructor(public covidService: CovidService, private http: HttpClient) { }

  ngOnInit(): void {

    this.dBar = [];
    for (let i = 1; i < 8; i++) {
      this.dBar.push(moment().subtract(8 - i, 'd').format("DD MMM"));
    }
    this.createChart1_4();
    this.createChart2();
    this.createChart3();
  }

  private createChart1_4() { 
    this.chart1data$ = {
      "Country": "All", "Date": "Today", "NewConfirmed": 0, "TotalConfirmed": 0, "NewDeaths": 0, "TotalDeaths": 0,
      "NewRecovered": 0, "TotalRecovered": 0
    };
    this.chart4data$ = [];
    this.http.get('https://api.covid19api.com/summary').subscribe(Response => {
      const ch1 = JSON.parse(JSON.stringify(Response)).Global;
      const ch2 = JSON.parse(JSON.stringify(Response)).Countries;
      this.chart1data$ = {
        Country: "All",
        Date: moment().format("DD-MM-YYYY"),
        NewConfirmed: parseInt(ch1.NewConfirmed),
        TotalConfirmed: parseInt(ch1.TotalConfirmed),
        NewDeaths: parseInt(ch1.NewDeaths),
        TotalDeaths: parseInt(ch1.TotalDeaths),
        NewRecovered: parseInt(ch1.NewRecovered),
        TotalRecovered: parseInt(ch1.TotalRecovered)
      }

      var countryData: globalData;
      for (let i = 0; i < ch2.length; i++) {
        countryData = {
          Country: ch2[i].Country,
          Date: moment().subtract(8 - i, 'd').format("DD-MM-YYYY"),
          NewConfirmed: parseInt(ch2[i].NewConfirmed),
          TotalConfirmed: parseInt(ch2[i].TotalConfirmed),
          NewDeaths: parseInt(ch2[i].NewDeaths),
          TotalDeaths: parseInt(ch2[i].TotalDeaths),
          NewRecovered: parseInt(ch2[i].NewRecovered),
          TotalRecovered: parseInt(ch2[i].TotalRecovered)
        }
        this.chart4data$.push(countryData);
      }

      this.activeCases = this.chart1data$.TotalConfirmed -
        this.chart1data$.TotalRecovered - this.chart1data$.TotalDeaths;

      this.recoveryRate = String(Math.trunc(this.chart1data$.TotalRecovered /
        this.chart1data$.TotalConfirmed * 10000) / 100) + "%";

      this.mortalityRate = String(Math.trunc(this.chart1data$.TotalDeaths /
        this.chart1data$.TotalConfirmed * 10000) / 100) + "%";

      var pieData = [this.chart1data$.TotalDeaths,
      this.chart1data$.TotalRecovered, this.activeCases];

      this.PChart = new Chart('pieChart', {
        type: 'pie',
        data: {
          labels: ["Dead Cases", "Recovered Cases", "Active Cases"],
          datasets: [{
            data: pieData,
            backgroundColor: [
              '#858484',
              '#e9e8e8',
              '#cacaca'
            ],
          }]
        }
      });

    });
  }

  private createChart2() { 
    this.chart2data$ = [];
    let days: string[] = [];
    for (let i = 0; i < 8; i++) { 
      days.push(moment().subtract(8 - i, 'd').format("M/DD/YY"));
    }
    this.http.get('https://corona.lmao.ninja/v2/historical/all?lastdays=8').subscribe(Response => {
      const res = JSON.parse(JSON.stringify(Response));
      let n_d = Object.keys(res.cases).length;
      console.log(n_d);
      for (let i = 0; i < 7; i++) {
        var oneDay: dailyData;
        oneDay = {
          Date: days[i+1],
          Confirmed: parseInt(res.cases[days[i+1]])-parseInt(res.cases[days[i]]), 
          Deaths: (parseInt(res.deaths[days[i+1]]) - parseInt(res.deaths[days[i]])),
          Recovered: (parseInt(res.recovered[days[i+1]]) - parseInt(res.recovered[days[i]]))
        }
        this.chart2data$.push(oneDay);
      }

      var dataBar = {
        labels: this.dBar,
        datasets: [
          {
            label: "Daily Deaths",
            data: [this.chart2data$[0].Deaths, this.chart2data$[1].Deaths, this.chart2data$[2].Deaths,
            this.chart2data$[3].Deaths, this.chart2data$[4].Deaths, this.chart2data$[5].Deaths,
            this.chart2data$[6].Deaths],
            borderWidth: 1,
            backgroundColor: '#858484'
          },
          {
            label: "Daily Recovered",
            data: [this.chart2data$[0].Recovered, this.chart2data$[1].Recovered,
            this.chart2data$[2].Recovered, this.chart2data$[3].Recovered,
            this.chart2data$[4].Recovered, this.chart2data$[5].Recovered,
            this.chart2data$[6].Recovered],
            borderWidth: 1,
            backgroundColor: '#e9e8e8'
          },
          {
            label: "Daily New Cases",
            data: [this.chart2data$[0].Confirmed, this.chart2data$[1].Confirmed,
            this.chart2data$[2].Confirmed, this.chart2data$[3].Confirmed,
            this.chart2data$[4].Confirmed, this.chart2data$[5].Confirmed,
            this.chart2data$[6].Confirmed],
            borderWidth: 1,
            backgroundColor: '#cacaca'
          }
        ]
      };

      var optionsB = {
        legend: {
          display: true
        },
        scales: {
          yAxes: [{
            ticks: {
              min: 0
            }
          }]
        }
      };

      var chart = new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: dataBar,
        options: optionsB
      });

    })
  }

  private createChart3() { 
    this.chart3data$ = [];
    this.http.get('https://corona.lmao.ninja/v2/historical/all').subscribe(Response => {
      const res = JSON.parse(JSON.stringify(Response));
      let len = Object.keys(res.cases).length; 
      let daysRes: string[] = [];
      let days: string[] = [];
      for (let i = 0; i < len; i++) { 
        daysRes.push(moment().subtract(len - i, 'd').format("M/D/YY"));
        days.push(moment().subtract(len - i, 'd').format("MM/DD/YY"));
      }
      for (let i = 0; i < len; i++) {
        var oneDay: dailyData;
        oneDay = {
          Date: days[i],
          Confirmed: res.cases[daysRes[i]],
          Deaths: res.deaths[daysRes[i]],
          Recovered: res.recovered[daysRes[i]]
        }
        this.chart3data$.push(oneDay);
      }

      let dLine: string[] = [];
      let dDeath: number[] = [];
      let dRecovered: number[] = [];
      let dCases: number[] = [];

      for (let i = 0; i < this.chart3data$.length; i++) {
        dLine.push(this.chart3data$[i].Date);
        dDeath.push(this.chart3data$[i].Deaths);
        dRecovered.push(this.chart3data$[i].Recovered);
        dCases.push(this.chart3data$[i].Confirmed);
      }


      var dataL = {
        labels: dLine,
        datasets: [
          {
            label: "Total Deaths",
            data: dDeath,
            borderWidth: 1,
            backgroundColor: '#858484'
          },
          {
            label: "Total Recovered",
            data: dRecovered,
            borderWidth: 1,
            backgroundColor: '#e9e8e8'
          },
          {
            label: "Total Cases",
            data: dCases,
            borderWidth: 1,
            backgroundColor: '#cacaca'
          }
        ]
      };

      var optionsLine = {
        legend: {
          display: true
        },
        scales: {
          yAxes: [{
            ticks: {
              min: 0
            }
          }]
        }
      };

      var chart = new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: dataL,
        options: optionsLine
      });

    })


  }

  public cArrow(id: string) {
    for (let id of this.ArrowsH_id) {
      document.getElementById(id).className = "las la-chevron-up";
    }
    for (let id of this.ArrowsB_id) {
      document.getElementById(id).className = "las la-chevron-down";
    }
    switch (id) {
      case "country" :
        this.country *= -1;
        if (this.country == 1) {
          document.getElementById("country_H").className = "las la-chevron-circle-up";
        } else {
          document.getElementById("country_B").className = "las la-chevron-circle-down";
        }
        break;
      case "newCases" :
        this.newConf *= -1;
        if (this.newConf == 1) {
          document.getElementById("newCases_H").className = "las la-chevron-circle-up";
        } else {
          document.getElementById("newCases_B").className = "las la-chevron-circle-down";
        }
        break;
      case "totCases":
        this.totalConf *= -1;
        if (this.totalConf == 1) {
          document.getElementById("totCases_H").className = "las la-chevron-circle-up";
        } else {
          document.getElementById("totCases_B").className = "las la-chevron-circle-down";
        }
        break;
      case "newRec":
        this.newReco *= -1;
        if (this.newReco == 1) {
          document.getElementById("newRec_H").className = "las la-chevron-circle-up";
        } else {
          document.getElementById("newRec_B").className = "las la-chevron-circle-down";
        }
        break;
      case "totRec":
        this.totalReco *= -1;
        if (this.totalReco == 1) {
          document.getElementById("totRec_H").className = "las la-chevron-circle-up";
        } else {
          document.getElementById("totRec_B").className = "las la-chevron-circle-down";
        }
        break;
      case "newDeath":
        this.newDeat *= -1;
        if (this.newDeat == 1) {
          document.getElementById("newDeath_H").className = "las la-chevron-circle-up";
        } else {
          document.getElementById("newDeath_B").className = "las la-chevron-circle-down";
        }
        break;
      case "totDeath":
        this.totalDeat *= -1;
        if (this.totalDeat == 1) {
          document.getElementById("totDeath_H").className = "las la-chevron-circle-up";
        } else {
          document.getElementById("totDeath_B").className = "las la-chevron-circle-down";
        }
        break;
    }
  }



}
