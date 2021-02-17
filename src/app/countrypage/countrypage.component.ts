import { Component, OnInit } from '@angular/core';
import { CovidService } from '../covid.service';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import { globalData } from '../globalData.model';
import { dailyData } from '../dailyData.model';
import * as moment from 'moment';


@Component({
  selector: 'app-country',
  templateUrl: './countrypage.component.html',
  styleUrls: ['./countrypage.component.css']
})
export class CountrypageComponent implements OnInit {
  name: string;
  slug: string;
  globaldata$: globalData;
  dailyData$: dailyData[];
  aprilData$: dailyData[];
  PieChart = [];
  BarChart = [];
  activeCases: number;
  recoveryRate: string;
  mortalityRate: string;

  constructor(public covidService: CovidService, private http: HttpClient) { }

  ngOnInit(): void {

    this.name = decodeURIComponent(window.location.href.split("/")[3]);
    this.slug = this.name.replace(" ", "-").toLowerCase();

    this.createChart1_2();
    this.createChart3();
    this.createChart4();
  }

  private createChart1_2() {
    this.globaldata$ = {
      "Country": "All", "Date": "Today", "NewConfirmed": 0, "TotalConfirmed": 0, "NewDeaths": 0, "TotalDeaths": 0,
      "NewRecovered": 0, "TotalRecovered": 0
    };
    this.covidService.getSummary(this.name)
      .subscribe((summary: globalData) => {
        if (summary == undefined
          || summary.Date != moment().format("DD-MM-YYYY")) {
          this.http.get('https://api.covid19api.com/summary').subscribe(Response => {
            const all = JSON.parse(JSON.stringify(Response)).Countries;
            let res = all[0];
            for (let i = 0; i < all.length; i++) {
              if (all[i].Slug == this.slug) {
                res = all[i]
              }
            }
            this.globaldata$ = {
              Country: this.name,
              Date: moment().format("DD-MM-YYYY"),
              NewConfirmed: parseInt(res.NewConfirmed),
              TotalConfirmed: parseInt(res.TotalConfirmed),
              NewDeaths: parseInt(res.NewDeaths),
              TotalDeaths: parseInt(res.TotalDeaths),
              NewRecovered: parseInt(res.NewRecovered),
              TotalRecovered: parseInt(res.TotalRecovered)
            }

            this.covidService.updateSummary(this.name, this.globaldata$);

            this.activeCases = this.globaldata$.TotalConfirmed -
              this.globaldata$.TotalRecovered - this.globaldata$.TotalDeaths;

            this.recoveryRate = String(Math.trunc(this.globaldata$.TotalRecovered /
              this.globaldata$.TotalConfirmed * 10000) / 100) + "%";

            this.mortalityRate = String(Math.trunc(this.globaldata$.TotalDeaths /
              this.globaldata$.TotalConfirmed * 10000) / 100) + "%";

            var pieData = [this.globaldata$.TotalDeaths,
            this.globaldata$.TotalRecovered, this.activeCases];

            this.PieChart = new Chart('pieChart', {
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
        } else {
          console.log("test")
          this.globaldata$ = summary;
          this.activeCases = this.globaldata$.TotalConfirmed -
            this.globaldata$.TotalRecovered - this.globaldata$.TotalDeaths;

          this.recoveryRate = String(Math.round(this.globaldata$.TotalRecovered /
            this.globaldata$.TotalConfirmed * 10000) / 100) + "%";

          this.mortalityRate = String(Math.round(this.globaldata$.TotalDeaths /
            this.globaldata$.TotalConfirmed * 10000) / 100) + "%";

          var pieData = [this.globaldata$.TotalDeaths,
          this.globaldata$.TotalRecovered, this.activeCases];

          this.PieChart = new Chart('pieChart', {
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
        }
      });
  }

  private createChart3() {
    this.dailyData$ = [];
    let days: string[] = [];
    for (let i = 0; i < 8; i++) {
      days.push(moment().subtract(8 - i, 'd').format("YYYY-MM-DD"));
    }
    this.http.get('https://api.covid19api.com/total/dayone/country/' + this.slug).subscribe(Response => {
      const res = JSON.parse(JSON.stringify(Response));
      for (let i = res.length - 8; i < res.length; i++) {
        var oneDay: dailyData;
        oneDay = {
          Date: days[i],
          Confirmed: parseInt(res[i].Confirmed) - parseInt(res[i - 1].Confirmed),
          Deaths: parseInt(res[i].Deaths) - parseInt(res[i - 1].Deaths),
          Recovered: parseInt(res[i].Recovered) - parseInt(res[i - 1].Recovered)
        }
        this.dailyData$.push(oneDay);
      }
      let daysBar: string[] = [];
      for (let i = 0; i < 7; i++) {
        daysBar.push(moment().subtract(8 - i, 'd').format("DD MMM"));
      }
      var dataBar = {
        labels: daysBar,
        datasets: [
          {
            label: "Daily Deaths",
            data: [this.dailyData$[0].Deaths, this.dailyData$[1].Deaths, this.dailyData$[2].Deaths,
            this.dailyData$[3].Deaths, this.dailyData$[4].Deaths, this.dailyData$[5].Deaths,
            this.dailyData$[6].Deaths],
            borderWidth: 1,
            backgroundColor: '#858484'
          },
          {
            label: "Daily Recovered",
            data: [this.dailyData$[0].Recovered, this.dailyData$[1].Recovered,
            this.dailyData$[2].Recovered, this.dailyData$[3].Recovered,
            this.dailyData$[4].Recovered, this.dailyData$[5].Recovered,
            this.dailyData$[6].Recovered],
            borderWidth: 1,
            backgroundColor: '#e9e8e8'
          },
          {
            label: "Daily New Cases",
            data: [this.dailyData$[0].Confirmed, this.dailyData$[1].Confirmed,
            this.dailyData$[2].Confirmed, this.dailyData$[3].Confirmed,
            this.dailyData$[4].Confirmed, this.dailyData$[5].Confirmed,
            this.dailyData$[6].Confirmed],
            borderWidth: 1,
            backgroundColor: '#cacaca'
          }
        ]
      };

      var optionsBar = {
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
        options: optionsBar
      });

    })
  }


  private createChart4() {
    this.aprilData$ = [];
    this.http.get('https://api.covid19api.com/total/dayone/country/' + this.slug).subscribe(Response => {
      const res = JSON.parse(JSON.stringify(Response));
      for (let i = 0; i < res.length; i++) {
        if (res[i].Province.length < 1) {
          var oneDay: dailyData;
          oneDay = {
            Date: moment(new Date(res[i].Date.split("T")[0])).format("DD MMM"),
            Confirmed: res[i].Confirmed,
            Deaths: res[i].Deaths,
            Recovered: res[i].Recovered
          }
          this.aprilData$.push(oneDay);
        }
      }

      let daysLine: string[] = [];
      let daysDeath: number[] = [];
      let daysRecovered: number[] = [];
      let daysCases: number[] = [];

      for (let i = 0; i < this.aprilData$.length; i++) {
        if (i % 3 == 0) {
          this.aprilData$.splice(i, 1);
        }
      }

      for (let i = 0; i < this.aprilData$.length; i++) {
        daysLine.push(this.aprilData$[i].Date);
        daysDeath.push(this.aprilData$[i].Deaths);
        daysRecovered.push(this.aprilData$[i].Recovered);
        daysCases.push(this.aprilData$[i].Confirmed);
      }


      var dataLine = {
        labels: daysLine,
        datasets: [
          {
            label: "Total Deaths",
            data: daysDeath,
            borderWidth: 1,
            backgroundColor: '#858484'
          },
          {
            label: "Total Recovered",
            data: daysRecovered,
            borderWidth: 1,
            backgroundColor: '#e9e8e8'
          },
          {
            label: "Total Cases",
            data: daysCases,
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
        data: dataLine,
        options: optionsLine
      });

    })


  }

  public backToHomepage() {
    this.covidService.backToHomepage();
  }

}

