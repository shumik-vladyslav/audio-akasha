import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FirestoreService, User } from '../services/firestore.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  unsubscribeAll$: Subject<any> = new Subject();
  statuses = [
    {name: 'Монах'},
    {name: 'Послушник'},
    {name: 'Кандидат'},
    {name: 'Брахмачари'},
    {name: 'Мирянин'},
  ];
  userForm: FormGroup;
  constructor(
    private firestore: FirestoreService,
    private fb: FormBuilder
  ) {
    this.userForm = fb.group({
      name: ['', Validators.required],
      status: ['', Validators.required]
    })
   }


  ngOnInit(): void {
    this.userForm.valueChanges.subscribe(v => {
      console.log(v);
      
    })


    this.firestore.getUsers().pipe(takeUntil(this.unsubscribeAll$)).subscribe((users: User[]) => {
      console.log(users);
      
      this.users = users;
    });
  };
  
  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  };

  createUser() {
    const form = this.userForm.value;
    const user = new User('new', form.name, form.status, true);
    this.firestore.addUser(user);
    this.userForm.reset();
  };

  deleteUser(user) {
    this.firestore.deleteUser(user);
  };

  changeActivity(user) {
    user.checked = !user.checked;
    this.firestore.updateUser(user);
  }
}
