export interface IRadioAPI {
  host: string;
  apiKey: string;
}

export interface IPlayerRadioSearch{
  radioID: string;
  ganreID: string;
  radioName: string;
  country_2_letterCode: string;
  genreName: string;
  streamURL: string;
  logoImg: string;
}

export interface IPlayerRadioNowPlaying {
  artistName: string;
  songName: string;
  radioName: string;
  radioID: string;
  streamURL: string;
  radioLogo: string;
  date: Date;
}

export interface IPlayerRadioGenre {
  genreID: string;
  genreName: string;
}

export interface IPlayerRadioCountry {
  country_2_letterCode: string;
  name: string;
}

export interface IPlayerRadioHit {
  artistName: string;
  songName: string;
  occurrences: string;
}