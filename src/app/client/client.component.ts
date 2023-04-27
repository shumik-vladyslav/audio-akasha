import { ChangeDetectorRef, Component } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: 'client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent {
  daysOfWeek: string[] = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  dates: string[] = ['17', '18', '19', '20', '21', '22', '23'];
  names = [{ name: 'Аравиндини' }, { name: 'Санаткумар' }, { name: 'Экантини' }, { name: 'Ведапракаш' }, { name: 'Омкар' }];
  options = [{ name: 'пр1' }, { name: 'пр2' }, { name: 'пр3' }, { name: 'пос1' }, { name: 'пос2' }, { name: 'пос3' }, { name: "ИУ" }];
  days = [{ d0: "", value: [] }, { d1: "", value: [] }, { d2: "", value: [] }, { d3: "", value: [] }, { d4: "", value: [] }, { d5: "", value: [] }, { d6: "", value: [] }, { d7: "", value: [] }]
  searchValue = { name: "", d1: "", d2: "", d3: "", d4: "", d5: "", d6: "", d7: "" }
  name = "";
  items = [];
  validate;
  datesRange: string = "17.04-23.04"

  constructor() { }

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
    csvContent += '№, Имя,'
    this.daysOfWeek.forEach((day: string) => {
      csvContent += day + ",";
    });
    csvContent += '\n';
    this.items.forEach((item, index) => {
      csvContent += index + 1 + ',';
      csvContent += item.name + ',';
      if((item.d1 as Array<string>)?.length) {
        csvContent += item.d1.join(' ') + ',';
      } else {
        csvContent += '-,';
      };
      if((item.d2 as Array<string>)?.length) {
        csvContent += item.d2.join(' ') + ',';
      } else {
        csvContent += '-,';
      };
      if((item.d3 as Array<string>)?.length) {
        csvContent += item.d3.join(' ') + ',';
      } else {
        csvContent += '-,';
      };
      if((item.d4 as Array<string>)?.length) {
        csvContent += item.d4.join(' ') + ',';
      } else {
        csvContent += '-,';
      };
      if((item.d5 as Array<string>)?.length) {
        csvContent += item.d5.join(' ') + ',';
      } else {
        csvContent += '-,';
      };
      if((item.d6 as Array<string>)?.length) {
        csvContent += item.d6.join(' ') + ',';
      } else {
        csvContent += '-,';
      };
      if((item.d7 as Array<string>)?.length) {
        csvContent += item.d7.join(' ') + ',';
      } else {
        csvContent += '-,';
      };
      csvContent += '\n';
    });
    this.writeContents(csvContent, 'CSV_File.csv', '');
    
  }
  writeContents(content: any, fileName: string, contentType: string) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
}
