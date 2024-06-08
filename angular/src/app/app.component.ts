import { Component, OnInit } from '@angular/core';
import { NbpService } from './services/nbp.service';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {availableCurrencies} from "../consts/availableCurrencies";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = "";

  selectedCurrency = 'EUR';
  currencies = availableCurrencies;

  dayRates: any;
  monthsRates: any;
  quarterRates: any;
  yearRates: any;

  isError = false;

  constructor(private nbpService: NbpService) { }

  ngOnInit() {
    this.loadRates(this.selectedCurrency);
    console.log("XD")
  }

  synchronizeRates() {
    this.nbpService.synchronizeAllRatesInDB(this.selectedCurrency, (data) => this.parseRates(data) );
    this.isError = false;
  }

  loadRates(currency: string, alterData?: any) {
    this.nbpService.getRatesFromDB(currency).subscribe(data => {
      this.parseRates(alterData || data)
    });
  }

  parseRates(data: any){
    if (data.length  === 0) {
      this.isError = true;

      return;
    }

    this.title = data[0].znak_waluty;

    const dataParsed  = JSON.parse(data[0].kurs);
    this.yearRates = dataParsed;

    const lastMonthDayCount = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()

    this.dayRates = dataParsed.slice(-1);
    this.monthsRates = dataParsed.slice(0, lastMonthDayCount);
    this.quarterRates = dataParsed.slice(0, lastMonthDayCount === 30 ? (2*30)+31 : lastMonthDayCount === 28 ? 28+30+31 : (2*31)+30);
  }
}
