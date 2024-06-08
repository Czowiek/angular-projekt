import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {firstValueFrom, Observable} from 'rxjs';
import {getNBPApiUrl} from "../../helpers/getNBPApiUrl";
import {getFirstAndLastDayOfCurrentYear} from "../../helpers/getFirstAndLastDayOfCurrentYear";
import {availableCurrencies} from "../../consts/availableCurrencies";

@Injectable({
  providedIn: 'root'
})
export class NbpService {
  constructor(private http: HttpClient) { }

  getRates(startDate: string, endDate: string, crr: string): Observable<any> {
    const url = `${getNBPApiUrl(crr)}/${startDate}/${endDate}/?format=json`;
    return this.http.get<any>(url);
  }

  async synchronizeAllRatesInDB(currency: string, callback?: (data:any) => void) {
    const { firstDay, lastDay } = getFirstAndLastDayOfCurrentYear();

    const rates = await Promise.all(availableCurrencies.map((currency) => {
      return firstValueFrom(this.getRates(firstDay, lastDay, currency));
    }));

    const ratesParsed = rates.map(({ code, rates }) => ({
      znak_waluty: code,
      data: new Date().toLocaleString(),
      kurs: JSON.stringify(rates)
    }));

    await firstValueFrom(this.postRatesToDB(ratesParsed));

    callback?.(ratesParsed.filter((c) => c.znak_waluty === currency));
  }

  getRatesFromDB(type: string): Observable<any> {
    const url = `http://localhost:8000/data/`;
    const params = new HttpParams().set('currency_type', type);
    return this.http.get<any>(url, { params });
  }

  postRatesToDB(data: any[]): Observable<any> {
    const url = `http://localhost:8000/data/`;
    return this.http.post<any>(url, data);
  }
}
