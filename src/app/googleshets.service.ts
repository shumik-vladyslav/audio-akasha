import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { GoogleApiService,  } from 'ng-gapi';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private readonly SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
  private authToken: string;

  private readonly API_KEY = 'AIzaSyBthCzA7C3JANVvG5lrlg221If6zZTzY4Q';
  private readonly CLIENT_ID = '773332166368-iocctmevk47t3fa21ejkq2knlsb7ssb8.apps.googleusercontent.com';
  private readonly DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
  private readonly SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
  secred = "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";

  private gapiLoaded: boolean = false;

  private user: any;

  constructor() {



  }



}
