import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {firstValueFrom, Observable} from 'rxjs';
import {zwrocPierwszyDzienTegoRoku} from "../../helpers/zwrocPierwszyDzienTegoRoku";
import {waluty} from "../../waluty";
import {zwrocDzisiejszaDate} from "../../helpers/zwrocDzisiejszaDate";

@Injectable({
  providedIn: 'root'
})
export class NbpService {
  constructor(private http: HttpClient) { }

  pobierzDaneZNBP(startDate: string, endDate: string, crr: string): Observable<any> {
    const url = `http://api.nbp.pl/api/exchangerates/rates/A/${crr}/${startDate}/${endDate}/?format=json`;
    return this.http.get<any>(url);
  }

  async odswiezDaneWBD(currency: string, callback?: (data:any) => void) {
    const pierwszyDzienTegoRoku = zwrocPierwszyDzienTegoRoku();

    const kursy = await Promise.all(waluty.map((currency) => {
      return firstValueFrom(this.pobierzDaneZNBP(pierwszyDzienTegoRoku, zwrocDzisiejszaDate(), currency));
    }));

    const kursy2 = kursy.map(({ code, rates }) => ({
      znak_waluty: code,
      data: new Date().toLocaleString(),
      kurs: JSON.stringify(rates)
    }));

    await firstValueFrom(this.wyslijDaneDoBD(kursy2));

    callback?.(kursy2.filter((c) => c.znak_waluty === currency));
  }

  pobierzDaneZBD(type: string): Observable<any> {
    const url = `http://localhost:8000/data/`;
    const params = new HttpParams().set('currency_type', type);
    return this.http.get<any>(url, { params });
  }

  wyslijDaneDoBD(data: any[]): Observable<any> {
    const url = `http://localhost:8000/data/`;
    return this.http.post<any>(url, data);
  }
}
