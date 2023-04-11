import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogEditDialog } from '../dialog-edit/dialog-edit.component';
declare var google;

@Component({
  selector: 'admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  spreadsheet_id = '1BE7BU9fLRHuxxP6zY9glfAOd60mwBzEeP9CoRyRovBQ';
  api_key = 'AIzaSyD-GqI5FqdZHCkFZOV3Kjhd9hG9TCIt12M';
  url = "https://sheets.googleapis.com/v4/spreadsheets/";

  tab_name = 'category';

  displayedColumn = ["Дата", "Тип", "Статус аудио", "Писание", "Название", "Комментарии", "actions"];
  data = [];
  displayedColumns: string[] = [];

  loaded;

  dataSource;
  access_token;

  modelChanged: Subject<string> = new Subject<string>();


  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private http: HttpClient, public dialog: MatDialog) {
    this.load();

  }

  edit(row, index) {
    const dialogRef = this.dialog.open(DialogEditDialog, {
      data: {type:row["Тип"], status:row["Статус аудио"]},
      height: '400px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if(result) {
        var elementPos = this.data.map(function(x) {return x.ID; }).indexOf(row.ID);
        this.update("B", (elementPos+2), result.type);
        this.update("C", (elementPos+2), result.status);
        setTimeout(() => {
        this.load();

        }, 2000);
      }
    });
    console.log(row, index);
    console.log(this.data.find(x => x.ID === row.ID));

  }

  load() {
    this.loaded = false;
    if(localStorage.getItem('access_token')) {
      this.access_token = localStorage.getItem('access_token');
      // this.update();
    }


    this.modelChanged.pipe(
      debounceTime(2000),
      distinctUntilChanged()
    )
      .subscribe(filterValue => {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.dataSource.filter = filterValue;
      });

    this.http.get(`${this.url}${this.spreadsheet_id}/values/${this.tab_name}?alt=json&key=${this.api_key}`)
      .subscribe((data: any) => {
        let values = data.values;
        [this.displayedColumns, ...values] = values;
        this.data = values.map(element => {
          return this.displayedColumns.reduce((acc, key, i) => {
            acc[key] = element[i] || '';
            return acc;
          }, {});
        });
        console.log(data, values, this.data);
        this.dataSource = new MatTableDataSource<any>(this.data);
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.filterPredicate = (data: Element, filter: string) =>
            data['Писание'].trim().toLowerCase().indexOf(filter) != -1;
        }, 50);
        this.loaded = true;
      });
  }

  update(latter, index, value) {
    this.http.put(`${this.url}${this.spreadsheet_id}/values/${this.tab_name}!${latter}${index}%3AS6091?valueInputOption=USER_ENTERED&alt=json&key=${this.api_key}`, {
      "values":[[value]]
    }, {
      headers: {
        'Authorization': `Bearer ${this.access_token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe((data) => {
      // handle response data here
    },(err) => {console.log(err);
    });
  }

  login() {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: '849398704426-9qoq4gsjle1aiq16d217k73reo3m7llm.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      prompt: '',// Specified as an empty string to auto select the account which we have already consented for use.
      callback: (tokenResponse) => {
      console.log(tokenResponse);
      this.access_token = tokenResponse.access_token;
      localStorage.setItem('access_token', tokenResponse.access_token);
      },
    });
    client.requestAccessToken();
  }
}
