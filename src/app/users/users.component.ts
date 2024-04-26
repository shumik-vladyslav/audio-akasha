import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FirestoreService, User } from '../services/firestore.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  unsubscribeAll$: Subject<any> = new Subject();
  servicesList = [];
  statuses = [
    {name: 'Монах'},
    {name: 'Послушник'},
    {name: 'Кандидат'},
    {name: 'Брахмачари'},
    {name: 'Мирянин'},
  ];
  userForm: FormGroup;
  serviceForm: FormGroup;
  constructor(
    private firestore: FirestoreService,
    private fb: FormBuilder
  ) {
    this.userForm = fb.group({
      name: ['', Validators.required],
      status: ['', Validators.required]
    });
    this.serviceForm = fb.group({
      name: ['', Validators.required],
      isRequired: false
    })
   }


  ngOnInit(): void {
    this.firestore.getUsers().pipe(takeUntil(this.unsubscribeAll$)).subscribe((users: User[]) => {
      console.log(users);
      if (!users) {
        return;
      };
      this.users = users;
    });
   
    this.firestore.getServices().pipe(takeUntil(this.unsubscribeAll$)).subscribe((services) => {
      console.log(services);
      if (!services) {
        return;
      };
      this.servicesList = services;
    }); 
  };
  
  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  };

  createUser() {
    const form = this.userForm.value;
    const user = {
      name: form.name,
      role: form.status,
      checked: true
    };
    this.users.push(user as any);
    console.log(user, this.users);
    
    this.firestore.addUser(this.users);
    this.userForm.reset();
  };

  deleteUser(user, index) {
    this.users.splice(index, 1)
    this.firestore.deleteUser(this.users);
  };

  deleteService(service, i) {
    this.servicesList.splice(i, 1);
    this.firestore.updateServices(this.servicesList);
  }

  addService() {
    const form = this.serviceForm.value;
    this.servicesList.push({name: form.name, isRequired: form.isRequired});
    this.firestore.updateServices(this.servicesList);
    this.serviceForm.reset();
  }

  changeActivity(user) {
    user.checked = !user.checked;
    this.firestore.updateUser(this.users);
  }

  upUser(user, index) {
    this.users.splice(index,1);
    this.users.splice(index-1, 0, user);
    this.firestore.updateUser(this.users);
  }

  downUser(user, index) {
    this.users.splice(index,1);
    this.users.splice(index+1, 0, user);
    this.firestore.updateUser(this.users);
  }
}
