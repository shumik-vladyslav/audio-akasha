import { AfterViewInit, ChangeDetectorRef, Component, Injectable, OnInit } from "@angular/core";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { FirestoreService } from "../services/firestore.service";
import { DateAdapter } from '@angular/material/core';
import {
  MatDateRangeSelectionStrategy,
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';
import { MatDialog } from "@angular/material/dialog";
import { ServiceDialogComponent } from "../service-dialog/service-dialog.component";
import { UsersComponent } from "../users/users.component";
import { take } from "rxjs/operators";
import { utils, writeFileXLSX } from 'xlsx';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Media,
  // PictureRun,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
  VerticalPositionAlign,
  WidthType,
  Header,
  Footer,
  Table,
  TableRow,
  TableCell,
  HeightRule,
  Styles
} from "docx";
import { saveAs } from "file-saver";

@Injectable()
export class FiveDayRangeSelectionStrategy<D>
  implements MatDateRangeSelectionStrategy<D> {
  constructor(private _dateAdapter: DateAdapter<D>) { }

  selectionFinished(date: D | null): DateRange<D> {
    return this._createFiveDayRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this._createFiveDayRange(activeDate);
  }

  private _createFiveDayRange(date: D | null): DateRange<D> {
    if (date) {
      const start = this._dateAdapter.addCalendarDays(date, -0);
      const end = this._dateAdapter.addCalendarDays(date, 6);
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  }
}

@Component({
  selector: 'client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: FiveDayRangeSelectionStrategy,
    },
  ],
})
export class ClientComponent implements OnInit, AfterViewInit {
  daysOfWeek: DayOfWeek[] = [
    { name: DayCodes.monday, label: 'Понедельник' },
    { name: DayCodes.tuesday, label: 'Вторник' },
    { name: DayCodes.wednesday, label: 'Среда' },
    { name: DayCodes.thursday, label: 'Четверг' },
    { name: DayCodes.friday, label: 'Пятница' },
    { name: DayCodes.saturday, label: 'Суббота' },
    { name: DayCodes.sunday, label: 'Воскресенье' }
  ];
  dates: string[] = ['17', '18', '19', '20', '21', '22', '23'];
  names = [{ name: 'Аравиндини' }, { name: 'Санаткумар' }, { name: 'Экантини' }, { name: 'Ведапракаш' }, { name: 'Омкар' }];
  options = [];
  days = [{ d0: "", value: [] }, { d1: "", value: [] }, { d2: "", value: [] }, { d3: "", value: [] }, { d4: "", value: [] }, { d5: "", value: [] }, { d6: "", value: [] }, { d7: "", value: [] }]
  searchValue = { name: "", d1: "", d2: "", d3: "", d4: "", d5: "", d6: "", d7: "" }
  name = "";
  items = [];
  validate;
  datesRange: string = "";
  users = [];
  includudUsers = [];

  form: FormGroup;

  usersMonah = [];
  usersPoslushnik = [];
  usersKandidat = [];
  usersBrahmashari = [];
  usersMiranin = [];
  requiredServicesLost = [];
  requiredDaysLost = [];
  isUsedAllRequired = false;

  constructor(
    private firestore: FirestoreService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {

    firestore.getUsers().subscribe(users => {
      if (!users) {
        return;
      };
      this.users = users;
      this.checkUsers();
    });
    firestore.getServices().subscribe(options => {
      if (!options) {
        return;
      };
      this.options = options;
      this.requiredServicesLost = options?.filter(option => option?.isRequired === true);
    });

    this.form = fb.group({
      usersMonah: fb.array([]),
      usersPoslushnik: fb.array([]),
      usersKandidat: fb.array([]),
      usersBrahmashari: fb.array([]),
      usersMiranin: fb.array([]),
      data: fb.array([]),
      weekControlGroup: this.fb.group({
        fromTime: this.fb.control(''),
        toTime: this.fb.control('')
      })
    });
    this.form.get('usersMonah').valueChanges.subscribe(value => {
      this.validateUserGroups();
    });
    this.form.get('usersPoslushnik').valueChanges.subscribe(value => {
      this.validateUserGroups();
    });
    this.form.get('usersKandidat').valueChanges.subscribe(value => {
      this.validateUserGroups();
    });
    this.form.get('usersBrahmashari').valueChanges.subscribe(value => {
      this.validateUserGroups();
    });
    this.form.get('usersMiranin').valueChanges.subscribe(value => {
      this.validateUserGroups();
    });
    this.form.get('weekControlGroup').valueChanges.subscribe((value: dateRange) => {
      if (value?.fromTime && value?.toTime) {
        this.datesRange = `${value?.fromTime.toLocaleDateString()} - ${value?.toTime.toLocaleDateString()}`;

        this.getDates(value?.fromTime, value?.toTime);
      }
    })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.firestore.getSelectedUserData().pipe(take(1)).subscribe((selectedUserData: SelectedUserData) => {
      if (selectedUserData) {
        selectedUserData.weekControlGroup.fromTime = new Date(selectedUserData.weekControlGroup.fromTime.seconds * 1000);
        selectedUserData.weekControlGroup.toTime = new Date(selectedUserData.weekControlGroup.toTime.seconds * 1000);
        this.form.get('weekControlGroup').patchValue(selectedUserData.weekControlGroup);
        for (const selectedUserDataKey in selectedUserData) {
          const usersArray = selectedUserData[selectedUserDataKey];
          if (usersArray && Array.isArray(usersArray)) {
            usersArray.forEach((userMonah, index) => {
              const currentUserControl = this.getAllUsers()?.find(usersArray => usersArray?.controls?.find(control => control.get('name')?.value == userMonah.name))?.controls.find(control => control?.get('name')?.value == userMonah.name);
              for (const key in userMonah) {
                if (key !== 'name') {
                  let selectedServices = [];
                  const dayServiceArray = userMonah[key];
                  if (dayServiceArray && Array.isArray(dayServiceArray) && dayServiceArray?.length) {
                    dayServiceArray?.forEach((service: string) => {
                      let selectedService = this.options?.find(option => option.name == service);
                      selectedServices.push(selectedService.name);
                    });
                  };
                  if (selectedServices) {
                    currentUserControl.get(key).patchValue(selectedServices);
                  };
                };
              }
            });
          }
        }
      }
    });
  }
  getDates(startDate: Date, endDate: Date) {
    let dateArray = new Array();
    let currentDate = new Date(startDate);
    this.dates = [];
    while (currentDate <= endDate) {
      this.dates.push(currentDate.getDate().toString());
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    };
    return dateArray;
  }

  get usersMonahArray() {
    return this.form.get('usersMonah') as FormArray;
  }
  get usersPoslushnikArray() {
    return this.form.get('usersPoslushnik') as FormArray;
  }
  get usersKandidatArray() {
    return this.form.get('usersKandidat') as FormArray;
  }
  get usersBrahmashariArray() {
    return this.form.get('usersBrahmashari') as FormArray;
  }
  get usersMiraninArray() {
    return this.form.get('usersMiranin') as FormArray;
  }

  get data() {
    return this.form.get('data') as FormArray;
  }

  onEnter(e) {
    this.searchValue.name = "";
    this.names.push({ name: e.target.value })
    this.name = e.target.value;
  }

  exel() {
    this.validate = true;
    this.exportToXLSX();
  };

  exportToCSV() {
    let csvContent = '';
    csvContent += '№, Имя, Отв. на неделе,'
    this.daysOfWeek.forEach((day: DayOfWeek) => {
      csvContent += day.label + ",";
    });
    csvContent += '\n';
    if (this.usersMonahArray.value?.length) {
      this.usersMonahArray.value.forEach((user, index) => {
        csvContent += index + 1 + ',';
        csvContent += user.name + ',';
        csvContent = this.buildCsvDays(csvContent, user);

        csvContent += '\n';
      });
      csvContent += '\n';
    };
    if (this.usersPoslushnikArray.value?.length) {
      this.usersPoslushnikArray.value.forEach((user, index) => {
        csvContent += index + 1 + ',';
        csvContent += user.name + ',';
        csvContent = this.buildCsvDays(csvContent, user);

        csvContent += '\n';
      });
      csvContent += '\n';
    };
    if (this.usersKandidatArray.value?.length) {
      this.usersKandidatArray.value.forEach((user, index) => {
        csvContent += index + 1 + ',';
        csvContent += user.name + ',';
        csvContent = this.buildCsvDays(csvContent, user);

        csvContent += '\n';
      });
      csvContent += '\n';
    };
    if (this.usersBrahmashariArray.value?.length) {
      this.usersBrahmashariArray.value.forEach((user, index) => {
        csvContent += index + 1 + ',';
        csvContent += user.name + ',';
        csvContent = this.buildCsvDays(csvContent, user);

        csvContent += '\n';
      });
      csvContent += '\n';
    };
    if (this.usersMiraninArray.value?.length) {
      this.usersMiraninArray.value.forEach((user, index) => {
        csvContent += index + 1 + ',';
        csvContent += user.name + ',';
        csvContent = this.buildCsvDays(csvContent, user);

        csvContent += '\n';
      });
      csvContent += '\n';
    };

    this.writeContents(csvContent, 'CSV_File.csv', '');
  }

  exportToXLSX() {
    let data = [];
    this.getAllUsers().forEach((usersArray: FormArray, index: number) => {
      if (index !== 0 && usersArray?.controls?.length) {
        data.push({})
      };
      let day1 = `Понедельник, ${this.dates[0]}`;
      let day2 = `Вторник, ${this.dates[1]}`;
      let day3 = `Среда, ${this.dates[2]}`;
      let day4 = `Четверг, ${this.dates[3]}`;
      let day5 = `Пятница, ${this.dates[4]}`;
      let day6 = `Суббота, ${this.dates[5]}`;
      let day7 = `Воскресенье, ${this.dates[6]}`;
      usersArray.controls.forEach((userControl: AbstractControl, userIndex: number) => {
        let obj = {
          '№': userIndex + 1,
          'Имя': userControl.get('name').value,
          'Отв. на неделе': userControl.get('d0').value.toString().replace(/[\[\]]/g, ''),
        };
        obj[day1] = userControl.get('d1').value.toString().replace(/[\[\]]/g, ''),
          obj[day2] = userControl.get('d2').value.toString().replace(/[\[\]]/g, ''),
          obj[day3] = userControl.get('d3').value.toString().replace(/[\[\]]/g, ''),
          obj[day4] = userControl.get('d4').value.toString().replace(/[\[\]]/g, ''),
          obj[day5] = userControl.get('d5').value.toString().replace(/[\[\]]/g, ''),
          obj[day6] = userControl.get('d6').value.toString().replace(/[\[\]]/g, ''),
          obj[day7] = userControl.get('d7').value.toString().replace(/[\[\]]/g, ''),

          data.push(obj);
      })
    });
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFileXLSX(wb, "table.xlsx");
  }

  buildCsvDays(csvContent, item) {
    if ((item.d0 as Array<string>)?.length) {
      csvContent += item.d1.join(' ') + ',';
    } else {
      csvContent += '-,';
    };
    if ((item.d1 as Array<string>)?.length) {
      csvContent += item.d1.join(' ') + ',';
    } else {
      csvContent += '-,';
    };
    if ((item.d2 as Array<string>)?.length) {
      csvContent += item.d2.join(' ') + ',';
    } else {
      csvContent += '-,';
    };
    if ((item.d3 as Array<string>)?.length) {
      csvContent += item.d3.join(' ') + ',';
    } else {
      csvContent += '-,';
    };
    if ((item.d4 as Array<string>)?.length) {
      csvContent += item.d4.join(' ') + ',';
    } else {
      csvContent += '-,';
    };
    if ((item.d5 as Array<string>)?.length) {
      csvContent += item.d5.join(' ') + ',';
    } else {
      csvContent += '-,';
    };
    if ((item.d6 as Array<string>)?.length) {
      csvContent += item.d6.join(' ') + ',';
    } else {
      csvContent += '-,';
    };
    if ((item.d7 as Array<string>)?.length) {
      csvContent += item.d7.join(' ') + ',';
    } else {
      csvContent += '-,';
    };
    return csvContent;
  }

  writeContents(content: any, fileName: string, contentType: string) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  checkUsers() {
    this.includudUsers = [];
    this.clearUserDatas();
    this.users.forEach(user => {
      if (user.checked) {
        this.includudUsers.push(user);
        this.sortUsers(user);
      }
    })
  }
  sortUsers(user) {

    switch (user.role) {
      case "Монах":
        this.usersMonah.push(user);
        this.usersMonahArray.push(this.fb.group({
          name: this.fb.control(user.name),
          d0: this.fb.control([]),
          d1: this.fb.control([]),
          d2: this.fb.control([]),
          d3: this.fb.control([]),
          d4: this.fb.control([]),
          d5: this.fb.control([]),
          d6: this.fb.control([]),
          d7: this.fb.control([]),
        }));
        break;
      case "Послушник":
        this.usersPoslushnik.push(user);
        this.usersPoslushnikArray.push(this.fb.group({
          name: this.fb.control(user.name),
          d0: this.fb.control([]),
          d1: this.fb.control([]),
          d2: this.fb.control([]),
          d3: this.fb.control([]),
          d4: this.fb.control([]),
          d5: this.fb.control([]),
          d6: this.fb.control([]),
          d7: this.fb.control([]),
        }));
        break;
      case "Кандидат":
        this.usersKandidat.push(user);
        this.usersKandidatArray.push(this.fb.group({
          name: this.fb.control(user.name),
          d0: this.fb.control([]),
          d1: this.fb.control([]),
          d2: this.fb.control([]),
          d3: this.fb.control([]),
          d4: this.fb.control([]),
          d5: this.fb.control([]),
          d6: this.fb.control([]),
          d7: this.fb.control([]),
        }));
        break;
      case "Брахмачари":
        this.usersBrahmashari.push(user);
        this.usersBrahmashariArray.push(this.fb.group({
          name: this.fb.control(user.name),
          d0: this.fb.control([]),
          d1: this.fb.control([]),
          d2: this.fb.control([]),
          d3: this.fb.control([]),
          d4: this.fb.control([]),
          d5: this.fb.control([]),
          d6: this.fb.control([]),
          d7: this.fb.control([]),
        }));
        break;
      case "Мирянин":
        this.usersMiranin.push(user);
        this.usersMiraninArray.push(this.fb.group({
          name: this.fb.control(user.name),
          d0: this.fb.control([]),
          d1: this.fb.control([]),
          d2: this.fb.control([]),
          d3: this.fb.control([]),
          d4: this.fb.control([]),
          d5: this.fb.control([]),
          d6: this.fb.control([]),
          d7: this.fb.control([]),
        }));
        break;
    }
  }
  clearUserDatas() {
    this.usersMonah = [];
    this.usersPoslushnik = [];
    this.usersKandidat = [];
    this.usersBrahmashari = [];
    this.usersMiranin = [];
  }

  lostServices = {
    'd1': [],
    'd2': [],
    'd3': [],
    'd4': [],
    'd5': [],
    'd6': [],
    'd7': [],
  };

  validateUserGroups() {
    this.isUsedAllRequired = true;
    this.requiredDaysLost = [];
    const validateUserGroup = (usersArray: FormArray, dayCode: DayCodes, setError: boolean) => {
      usersArray.controls.forEach((control: FormGroup) => {
        control.controls[dayCode].setErrors(setError ? { notUsedService: true } : null);
      });
    }

    let isRequiredUsedInMonday: boolean = false;
    let isRequiredUsedInTuesday: boolean = false;
    let isRequiredUsedInWednesday: boolean = false;
    let isRequiredUsedInThursday: boolean = false;
    let isRequiredUsedInFriday: boolean = false;
    let isRequiredUsedInSaturday: boolean = false;
    let isRequiredUsedInSunday: boolean = false;

    this.lostServices = {
      'd1': [],
      'd2': [],
      'd3': [],
      'd4': [],
      'd5': [],
      'd6': [],
      'd7': [],
    };

    this.daysOfWeek.forEach((day: DayOfWeek) => {
      if (
        this.requiredServicesLost.every(requiredService => this.getAllUsers().some((userFormArray: FormArray) => (userFormArray.value as Array<any>)?.some(
          itemServices => itemServices[day.name]?.some(itemService => itemService == requiredService.name)
        )))

      ) {
        this.lostServices[day.name] = [];
        switch (day.name) {
          case DayCodes.monday:
            this.getAllUsers().forEach((userFormArray: FormArray) => {
              validateUserGroup(userFormArray, day.name, false);
            });
            isRequiredUsedInMonday = true;

            break;
          case DayCodes.tuesday:
            this.getAllUsers().forEach((userFormArray: FormArray) => {
              validateUserGroup(userFormArray, day.name, false);
            });
            isRequiredUsedInTuesday = true;
            break;
          case DayCodes.wednesday:
            this.getAllUsers().forEach((userFormArray: FormArray) => {
              validateUserGroup(userFormArray, day.name, false);
            });
            isRequiredUsedInWednesday = true;
            break;
          case DayCodes.thursday:
            this.getAllUsers().forEach((userFormArray: FormArray) => {
              validateUserGroup(userFormArray, day.name, false);
            });
            isRequiredUsedInThursday = true;
            break;
          case DayCodes.friday:
            this.getAllUsers().forEach((userFormArray: FormArray) => {
              validateUserGroup(userFormArray, day.name, false);
            });
            isRequiredUsedInFriday = true;
            break;
          case DayCodes.saturday:
            this.getAllUsers().forEach((userFormArray: FormArray) => {
              validateUserGroup(userFormArray, day.name, false);
            });
            isRequiredUsedInSaturday = true;
            break;
          case DayCodes.sunday:
            this.getAllUsers().forEach((userFormArray: FormArray) => {
              validateUserGroup(userFormArray, day.name, false);
            });
            isRequiredUsedInSunday = true;
            break;

          default:
            break;
        };

      } else {
        this.lostServices[day.name] = [...this.requiredServicesLost];

        this.requiredServicesLost.forEach(requiredService => this.getAllUsers().forEach((userFormArray: FormArray) => (userFormArray.value as Array<any>)?.forEach((itemServices) => {

          const existIndex = this.lostServices[day.name].findIndex(service => itemServices[day.name].some(serv => service.name == serv));
          if (existIndex > -1) {
            this.lostServices[day.name].splice(existIndex, 1)
          };
        }
        )));
        this.getAllUsers().forEach((userFormArray: FormArray) => {
          validateUserGroup(userFormArray, day.name, true);
        });
        if (!this.requiredDaysLost.some(lostDay => lostDay.name == day.name)) {
          this.requiredDaysLost.push(day);
        };
      };
    })

    if (!isRequiredUsedInMonday || !isRequiredUsedInTuesday || !isRequiredUsedInWednesday || !isRequiredUsedInThursday || !isRequiredUsedInFriday || !isRequiredUsedInSaturday || !isRequiredUsedInSunday) {
      this.isUsedAllRequired = false;
    };
  }

  getAllUsers(): Array<FormArray> {
    return new Array(
      this.usersMonahArray,
      this.usersPoslushnikArray,
      this.usersKandidatArray,
      this.usersBrahmashariArray,
      this.usersMiraninArray
    );

  }

  getAllUsersControls(): AbstractControl[] {
    return [
      ...this.usersMonahArray.controls,
      ...this.usersPoslushnikArray.controls,
      ...this.usersKandidatArray.controls,
      ...this.usersBrahmashariArray.controls,
      ...this.usersMiraninArray.controls
    ];
  }

  openDialog(): void {
    this.dialog.open(ServiceDialogComponent, {
      width: '990px'
    });
  }
  openUsersDialog(): void {
    this.dialog.open(UsersComponent, {
      width: '1000px'
    });
  }

  uploadToFirestore() {
    // this.form.value
    this.firestore.updateSelectedUserData(this.form.value);
  }
  isOptionSelected(valueArray: string[], value): boolean {
    if (!valueArray?.length) {
      return false;
    };
    return valueArray?.some(item => item == value);
  }
  toggleOption(option: string, formArray: FormArray, userIndex: number, dayCode: DayCodes,) {
    const selectedOptionIndex = formArray.controls[userIndex].get(dayCode).value?.findIndex(itm => itm == option);

    selectedOptionIndex > -1 ? formArray.controls[userIndex].get(dayCode).setValue(formArray.controls[userIndex].get(dayCode).value.splice(selectedOptionIndex, 1)) : formArray.controls[userIndex].get(dayCode).setValue([option, ...formArray.controls[userIndex].get(dayCode).value])
  }

  saveInDocFormat() {
    const usersSections = [];
    this.getAllUsers().forEach(userArr => {
      console.log('userArr', userArr);
      userArr.value.forEach(userData => {
        const tableItem = new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph(userData.name),
              ]
            }),
            new TableCell({
              children: [
                new Paragraph(userData.d0.toString()),
              ]
            }),
            new TableCell({
              children: [
                new Paragraph(userData.d1.toString()),
              ]
            }),
            new TableCell({
              children: [
                new Paragraph(userData.d2.toString()),
              ]
            }),
            new TableCell({
              children: [
                new Paragraph(userData.d3.toString()),
              ]
            }),
            new TableCell({
              children: [
                new Paragraph(userData.d4.toString()),
              ]
            }),
            new TableCell({
              children: [
                new Paragraph(userData.d5.toString()),
              ]
            }),
            new TableCell({
              children: [
                new Paragraph(userData.d6.toString()),
              ]
            }),
            new TableCell({
              children: [
                new Paragraph(userData.d7.toString()),
              ]
            }),
          ]
        })
        usersSections.push(tableItem);
      })
    })
    const doc = new Document({
      sections: [{
        headers: {
          default: new Header({
            children: [new Paragraph({ text: `Табель служения на неделю ${this.datesRange}`, style: "para" })]
          })
        },
        // footers: {
        //   default: new Footer({
        //     children: [new Paragraph({ text: "Footer", style: "para" })]
        //   })
        // },
        children: [
          new Table({
            width: { size: 110, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ text: "Имя", style: "para" })
                    ]
                  }),
                  new TableCell({
                    children: [new Paragraph('Отв. на неделе')]
                  }),
                  new TableCell({
                    children: [new Paragraph('Понедельник, '+ this.dates[0])]
                  }),
                  new TableCell({
                    children: [new Paragraph('Вторник, '+ this.dates[1])]
                  }),
                  new TableCell({
                    children: [new Paragraph('Среда, '+ this.dates[2])]
                  }),
                  new TableCell({
                    children: [new Paragraph('Четверг, '+ this.dates[3])]
                  }),
                  new TableCell({
                    children: [new Paragraph('Пятница, '+ this.dates[4])]
                  }),
                  new TableCell({
                    children: [new Paragraph('Суббота, '+ this.dates[5])]
                  }),
                  new TableCell({
                    children: [new Paragraph('Воскресенье, '+ this.dates[6])]
                  })

                ]
              }),
              ...usersSections,
            ]
          })
        ]
      }]
    });
    // doc.Styles.createParagraphStyle("para", "Para").font("Calibri");
    Packer.toBlob(doc).then(blob => {
      console.log(blob);
      saveAs(blob, "table.docx");
      console.log("Document created successfully");
    });
  }

}
export class DateRangePickerSelectionStrategyExample { }
export interface dateRange {
  fromTime: Date,
  toTime: Date
}
export interface DayOfWeek {
  name: DayCodes,
  label: string
}
export enum DayCodes {
  monday = 'd1',
  tuesday = 'd2',
  wednesday = 'd3',
  thursday = 'd4',
  friday = 'd5',
  saturday = 'd6',
  sunday = 'd7',
}
export interface SelectedUserData {
  data: [],
  usersBrahmashari: UserData[],
  usersKandidat: UserData[],
  usersMiranin: UserData[],
  usersMonah: UserData[],
  usersPoslushnik: UserData[],
  weekControlGroup: {
    fromTime: any,
    toTime: any
  }
}
export interface UserData {
  d0: string[],
  d1: string[],
  d2: string[],
  d3: string[],
  d4: string[],
  d5: string[],
  d6: string[],
  d7: string[],
  name: string
}