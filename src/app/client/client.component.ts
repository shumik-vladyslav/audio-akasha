import { ChangeDetectorRef, Component } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { FirestoreService } from "../services/firestore.service";

@Component({
  selector: 'client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent {
  daysOfWeek: string[] = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  dates: string[] = ['17', '18', '19', '20', '21', '22', '23'];
  names = [{ name: 'Аравиндини' }, { name: 'Санаткумар' }, { name: 'Экантини' }, { name: 'Ведапракаш' }, { name: 'Омкар' }];
  options = [];
  days = [{ d0: "", value: [] }, { d1: "", value: [] }, { d2: "", value: [] }, { d3: "", value: [] }, { d4: "", value: [] }, { d5: "", value: [] }, { d6: "", value: [] }, { d7: "", value: [] }]
  searchValue = { name: "", d1: "", d2: "", d3: "", d4: "", d5: "", d6: "", d7: "" }
  name = "";
  items = [];
  validate;
  datesRange: string = "17.04-23.04";
  users = [];
  includudUsers = [];

  form: FormGroup;

  usersMonah = [];
  usersPoslushnik = [];
  usersKandidat = [];
  usersBrahmashari = [];
  usersMiranin = [];

  constructor(
    private firestore: FirestoreService,
    private fb: FormBuilder
  ) {
    firestore.getUsers().subscribe(users => {
      this.users = users;
      console.log(this.users);
      this.checkUsers();
    });
    firestore.getServices().subscribe(options => {
      this.options = options;
      console.log(this.options);
    });
    this.form = fb.group({
      usersMonah: fb.array([]),
      usersPoslushnik: fb.array([]),
      usersKandidat: fb.array([]),
      usersBrahmashari: fb.array([]),
      usersMiranin: fb.array([]),
      data: fb.array([]),
    })
    // this.form = fb.array([{
    //   d1: this.fb.control('')
    // }]);
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
    console.log(e.target.value);
    this.searchValue.name = "";
    this.names.push({ name: e.target.value })
    this.name = e.target.value;
  }

  add() {
    this.items.push({
      name: this.name,
      d0: this.days[0].value,
      d1: this.days[1].value,
      d2: this.days[2].value,
      d3: this.days[3].value,
      d4: this.days[4].value,
      d5: this.days[5].value,
      d6: this.days[6].value,
      d7: this.days[7].value,
    });
  }

  addSpace() {
    this.items.push({
      name: "",
      d0: [],
      d1: [],
      d2: [],
      d3: [],
      d4: [],
      d5: [],
      d6: [],
      d7: [],
    });
  }

  exel() {
    this.validate = true;
    this.exportToCSV();
  };

  exportToCSV() {
    let csvContent = '';
    csvContent += '№, Имя, Отв. на неделе,'
    this.daysOfWeek.forEach((day: string) => {
      csvContent += day + ",";
    });
    csvContent += '\n';
    if(this.usersMonahArray.value?.length) {
      this.usersMonahArray.value.forEach((user, index) => {
        csvContent += index +1 + ',';
        csvContent += user.name + ',';
        csvContent = this.buildCsvDays(csvContent, user);
        
        csvContent += '\n';
      });
      csvContent += '\n';
    };
    if(this.usersPoslushnikArray.value?.length) {
      this.usersPoslushnikArray.value.forEach((user, index) => {
        csvContent += index +1 + ',';
        csvContent += user.name + ',';
        csvContent = this.buildCsvDays(csvContent, user);
        
        csvContent += '\n';
      });
      csvContent += '\n';
    };
    if(this.usersKandidatArray.value?.length) {
      this.usersKandidatArray.value.forEach((user, index) => {
        csvContent += index +1 + ',';
        csvContent += user.name + ',';
        csvContent = this.buildCsvDays(csvContent, user);
        
        csvContent += '\n';
      });
      csvContent += '\n';
    };
    if(this.usersBrahmashariArray.value?.length) {
      this.usersBrahmashariArray.value.forEach((user, index) => {
        csvContent += index +1 + ',';
        csvContent += user.name + ',';
        csvContent = this.buildCsvDays(csvContent, user);
        
        csvContent += '\n';
      });
      csvContent += '\n';
    };
    if(this.usersMiraninArray.value?.length) {
      this.usersMiraninArray.value.forEach((user, index) => {
        csvContent += index +1 + ',';
        csvContent += user.name + ',';
        csvContent = this.buildCsvDays(csvContent, user);
        
        csvContent += '\n';
      });
      csvContent += '\n';
    };
    
    this.writeContents(csvContent, 'CSV_File.csv', '');
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
        // this.data.push(this.fb.group({
        //   d0: this.fb.control(''),
        //   d1: this.fb.control(''),
        //   d2: this.fb.control(''),
        //   d3: this.fb.control(''),
        //   d4: this.fb.control(''),
        //   d5: this.fb.control(''),
        //   d6: this.fb.control(''),
        //   d7: this.fb.control(''),
        // }))
      }
    })
    console.log(this.data);

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
}
