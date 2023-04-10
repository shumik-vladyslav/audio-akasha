import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GoogleSheetsService } from './googleshets.service';
declare var google;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  spreadsheet_id = '1BE7BU9fLRHuxxP6zY9glfAOd60mwBzEeP9CoRyRovBQ';
  api_key = 'AIzaSyBthCzA7C3JANVvG5lrlg221If6zZTzY4Q';
  tab_name = 'category';

  displayedColumn = ["Дата", "Тип", "Писание", "Название", "Комментарии"];
  data = [];
  displayedColumns: string[] = [];

  loaded;

  dataSource;
  user;

  modelChanged: Subject<string> = new Subject<string>();


  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private http: HttpClient, private googleSheetsService: GoogleSheetsService) {

    setTimeout(() => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: '773332166368-iocctmevk47t3fa21ejkq2knlsb7ssb8.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        // hint: googleId,
        prompt: '',// Specified as an empty string to auto select the account which we have already consented for use.
        callback: (tokenResponse) => {
        console.log(tokenResponse);
        this.user = tokenResponse;
        this.update();
        },
      });
      client.requestAccessToken();
      // @ts-ignore
      google.accounts.id.renderButton(
      // @ts-ignore
      document.getElementById("google-button"),
        { theme: "outline", size: "large", width: "100%" }
      );
      // @ts-ignore
      google.accounts.id.prompt((notification: PromptMomentNotification) => {});
    }, 5000);



    let Client_ID = '773332166368-4vss4pijc76ptteg0mt07m0q2le47p3n.apps.googleusercontent.com';
    let apiseret_key = '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';

    this.modelChanged.pipe(
      debounceTime(2000),
      distinctUntilChanged()
    )
      .subscribe(filterValue => {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.dataSource.filter = filterValue;
      });

    http.get(`https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheet_id}/values/${this.tab_name}?alt=json&key=${this.api_key}`)
      .subscribe((data: any) => {
        let values = data.values;
        console.log(data, values);
        [this.displayedColumns, ...values] = values;
        this.data = values.map(element => {
          return this.displayedColumns.reduce((acc, key, i) => {
            acc[key] = element[i] || '';
            return acc;
          }, {});
        });
        this.dataSource = new MatTableDataSource<any>(this.data);
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.filterPredicate = (data: Element, filter: string) =>
            data['Писание'].trim().toLowerCase().indexOf(filter) != -1;
        }, 50);
        this.loaded = true;
      });

  }

  update() {
    this.http.put(`https://content-sheets.googleapis.com/v4/spreadsheets/1BE7BU9fLRHuxxP6zY9glfAOd60mwBzEeP9CoRyRovBQ/values/category!A3%3AS6091?valueInputOption=USER_ENTERED&alt=json&key=${this.api_key}`, {
      // "range": "category!M2:M3",
      "values":[["New value2"]]
    }, {
      headers: {
        'Authorization': `Bearer ${this.user.access_token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe((data) => {
      // handle response data here
    },(err) => {console.log(err);
    });
  }

}
