import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError, Subscribable, Subscription, Subject } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { RADIO_API } from "src/environments/set-environments";
import { IPlayerRadioSearch, IPlayerRadioCountry, IPlayerRadioNowPlaying, IPlayerRadioHit, IPlayerRadioGenre } from "../interfaces/interfaces";

const headers = {
  "x-rapidapi-host": RADIO_API.host,
  "x-rapidapi-key": RADIO_API.apiKey,
};

@Injectable({
  providedIn: "root",
})

export class RadioService {

  $radioInit: Subscription;
  radioInitStatus: boolean;
  radios: Array<IPlayerRadioSearch | IPlayerRadioNowPlaying> = [];
  radio: IPlayerRadioSearch | IPlayerRadioNowPlaying;
  $error: Subject<any> = new Subject<any>();
  $streamURL: string = '';

  constructor(private http: HttpClient) { }

  getRadioSearch(country: string = "ALL", genre: string = "ALL", keyword: string = ""): Observable<any> {
    return this.http
      .get(
        `https://30-000-radio-stations-and-music-charts.p.rapidapi.com/rapidapi?country=${country}&keyword=${keyword}&genre=${genre}`, {
        headers,
      }
      )
      .pipe(
        map((data: any) => {
          return {
            results: this.converObjectForRadio(data, this.convertToIPlayerRadioSearch)
          };
        })
      );
  }

  getCountriesList(): Observable<any> {
    return this.http
      .get(
        "https://30-000-radio-stations-and-music-charts.p.rapidapi.com/rapidapi?countries=", {
        headers,
      }
      )
      .pipe(
        map((data: any) => {
          return {
            results: this.converObjectForRadio(data, this.convertToIPlayerRadioCountry)
          };
        })
      );
  }

  getNowPlaying(): Observable<any> {
    return this.http
      .get(
        "https://30-000-radio-stations-and-music-charts.p.rapidapi.com/rapidapi?nowplaying=1", {
        headers,
      }
      )
      .pipe(
        map((data: any) => {
          return {
            results: this.converObjectForRadio(data, this.convertToIPlayerRadioNowPlaying)
          };
        })
      );
  }

  getRadioStationInfo(id: string | number): Observable<any> {
    return this.http.get(
      `https://30-000-radio-stations-and-music-charts.p.rapidapi.com/rapidapi?id=${id}`, {
      headers,
    }
    )
      .pipe(
        map((data: any) => {
          return {
            results: this.converObjectForRadio(data, this.convertToIPlayerRadioSearch)
          };
        })
      );
  }

  getMusicGenresList(): Observable<any> {
    return this.http.get(
      "https://30-000-radio-stations-and-music-charts.p.rapidapi.com/rapidapi?categories=1", {
      headers,
    }
    )
      .pipe(
        map((data: any) => {
          return {
            results: this.converObjectForRadio(data, this.convertToIPlayerRadioGenre)
          };
        })
      );
  }

  getDailyCharts(): Observable<any> {
    return this.http.get(
      "https://30-000-radio-stations-and-music-charts.p.rapidapi.com/rapidapi?charts24h=1", {
      headers,
    }
    )
      .pipe(
        map((data: any) => {
          return {
            results: this.converObjectForRadio(data, this.convertToIPlayerRadioHit)
          };
        })
      );
  }

  getWeeklyCharts(): Observable<any> {
    return this.http.get(
      "https://30-000-radio-stations-and-music-charts.p.rapidapi.com/rapidapi?chartsweek=1", {
      headers,
    }
    )
      .pipe(
        map((data: any) => {
          return {
            results: this.converObjectForRadio(data, this.convertToIPlayerRadioHit)
          };
        })
      );
  }

  getMonthlyCharts(): Observable<any> {
    return this.http.get(
      "https://30-000-radio-stations-and-music-charts.p.rapidapi.com/rapidapi?chartsmonth=1", {
      headers,
    }
    )
      .pipe(
        map((data: any) => {
          return {
            results: this.converObjectForRadio(data, this.convertToIPlayerRadioHit)
          };
        })
      );
  }

  converObjectForRadio(data: any, method: any): any {
    const allObj: any = data.results;
    const results: Array<IPlayerRadioNowPlaying> = [];
    for (const obj of allObj)
      results.push(method(obj));
    return results;
  }

  convertToIPlayerRadioSearch(item: any): IPlayerRadioSearch {
    return {
      radioID: item.i,
      ganreID: item.d,
      radioName: item.n,
      country_2_letterCode: item.c,
      genreName: item.g,
      streamURL: item.u,
      logoImg: item.l,
    };
  }

  convertToIPlayerRadioCountry(item: any): IPlayerRadioCountry {
    return {
      country_2_letterCode: item.code,
      name: item.name,
    };
  }

  convertToIPlayerRadioNowPlaying(item: any): IPlayerRadioNowPlaying {
    return {
      artistName: item.artist_song,
      songName: item.title_song,
      radioName: item.radio_name,
      radioID: item.radio_id,
      streamURL: item.radio_stream,
      radioLogo: item.radio_logo,
      date: new Date(item.date),
    };
  }

  convertToIPlayerRadioHit(item: any): IPlayerRadioHit {
    return {
      artistName: item.artist_song,
      songName: item.title_song,
      occurrences: item.occurrences,
    };
  }

  convertToIPlayerRadioGenre(item: any): IPlayerRadioGenre {
    return {
      genreID: item.i,
      genreName: item.c,
    };
  }

  radioInit(radio: IPlayerRadioSearch): void {
    this.radioInitStatus ? this.$radioInit.unsubscribe() : this.radioInitStatus = true;
    this.radio = radio;

    const req = this.http.get(radio.streamURL).pipe(
      catchError(this.handleError.bind(this))
    )

    this.$radioInit = req.subscribe(res => {
    }, err => {
        console.log(this.$streamURL);
        this.$streamURL = '';
        console.log(this.$streamURL);
        
      this.$radioInit.unsubscribe();
    });
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    const { streamURL } = this.radio;
    const { status, url } = error;
    switch (status) {
      case 0:
        this.$error.next('Something went wrong. The radio has been removed from the general list.');
        alert('0');
        this.saveRadioWichNoExist(streamURL);
        this.filterRadioFromRadioWichNoExist();
        break;
      case 200:
        this.$error.next('Something went wrong. The radio has been removed from the general list.');
        alert('200');
        this.saveRadioWichNoExist(streamURL);
        this.filterRadioFromRadioWichNoExist();
        break;
      case 304:
        this.$error.next('Something went wrong. The radio has been removed from the general list.');
        alert('304');
        this.saveRadioWichNoExist(streamURL);
        this.filterRadioFromRadioWichNoExist();
        break;
    }

    return throwError(error)
  }

  saveRadioWichNoExist(url: string): void {
    if (localStorage.getItem('radio-no-exist')) {
      const radiosNoExist: Array<string> = JSON.parse(localStorage.getItem('radio-no-exist'));
      radiosNoExist.push(url)
      localStorage.setItem('radio-no-exist', JSON.stringify(radiosNoExist));
    } else {
      const radiosNoExist = [];
      radiosNoExist.push(url);
      localStorage.setItem('radio-no-exist', JSON.stringify(radiosNoExist));
    }
    console.log(JSON.parse(localStorage.getItem('radio-no-exist')));
  }

  filterRadioFromRadioWichNoExist(): void {
    if (localStorage.getItem('radio-no-exist')) {
      const radiosNoExist = JSON.parse(localStorage.getItem('radio-no-exist'));
      for (const radioURL of radiosNoExist) {
        this.radios = this.radios.filter(radio => radio.streamURL !== radioURL);
      }
    }
  }

}
