import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
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
  
  constructor(private http: HttpClient) {}

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
    let results: Array < IPlayerRadioNowPlaying > = [];
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
  
}
