import { Component, OnInit } from '@angular/core';
import { NbpService } from './serwisy/nbp.service';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {waluty} from "../waluty";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = "";
  wybranaWaluta = 'USD';
  currencies = waluty;
  kursDzien: any;
  kursMiesiac: any;
  kursKwartal: any;
  wszystkieKursy: any;
  blad = false;

  constructor(private nbpService: NbpService) { }
  ngOnInit() {
    this.zaladujKurs(this.wybranaWaluta);
  }

  zaladujKurs(currency: string, alterData?: any) {
    this.nbpService.pobierzDaneZBD(currency).subscribe(data => {
      this.wyswietlKurs(alterData || data)
    });
  }

  wyswietlKurs(dane: any){
    if (dane.length  === 0) {
      this.blad = true;
      return;
    }

    this.title = dane[0].znak_waluty;

    const dataParsed  = JSON.parse(dane[0].kurs);
    this.wszystkieKursy = dataParsed;

    this.kursDzien = dataParsed.slice(-1);
    this.kursMiesiac = dataParsed.slice(0, 30);
    this.kursKwartal = dataParsed.slice(0, 90);
  }

  synchronizujDaneWBD() {
    this.nbpService.odswiezDaneWBD(this.wybranaWaluta, (data) => this.wyswietlKurs(data) );
    this.blad = false;
  }
}
