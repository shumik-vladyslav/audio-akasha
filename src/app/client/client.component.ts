import { ChangeDetectorRef, Component } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: 'client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent {
  daysOfWeek: string[] = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  names = [{name:'Аравиндини'}, {name:'Санаткумар'}, {name:'Экантини'}, {name:'Ведапракаш'}, {name:'Омкар'}];

  options = [{name:'пр1'}, {name:'пр2'}, {name:'пр3'}, {name:'пос1'}, {name:'пос2'}, {name:'пос3'}, {name:"ИУ"}];

  days = [{d1: "",value: []}, {d2: "",value:  []}, {d3: "",value:  []}, {d4: "",value:  []}, {d5: "",value: []}, {d6: "",value: []}, {d7: "",value: []}]

  searchValue= {name: "", d1: "", d2: "", d3: "", d4: "", d5: "", d6: "", d7: ""}
  name = "";

  items = [];

  constructor() {
  }

  onEnter(e) {
    console.log(e.target.value);
    this.searchValue.name = "";
    this.names.push({name: e.target.value})
    this.name = e.target.value;
  }

  add() {
    this.items.push({
      name: this.name,
      d1: this.days[0].value,
      d2: this.days[1].value,
      d3: this.days[2].value,
      d4: this.days[3].value,
      d5: this.days[4].value,
      d6: this.days[5].value,
      d7: this.days[6].value,
    });
  }
  
  addSpace() {
    this.items.push({
      name: "",
      d1: [],
      d2: [],
      d3: [],
      d4: [],
      d5: [],
      d6: [],
      d7: [],
    });
  }
  validate;
  exel() {
    this.validate = true;
  }
}
