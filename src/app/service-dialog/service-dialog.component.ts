import { Component, OnDestroy, OnInit } from '@angular/core';
import { FirestoreService, User } from '../services/firestore.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-service-dialog',
  templateUrl: './service-dialog.component.html',
  styleUrls: ['./service-dialog.component.scss']
})
export class ServiceDialogComponent implements OnInit, OnDestroy {
  unsubscribeAll$: Subject<any> = new Subject();
  users: User[] = [];
  serviceForm: FormGroup;
  servicesList = [];
  statuses = [
    {name: 'Монах'},
    {name: 'Послушник'},
    {name: 'Кандидат'},
    {name: 'Брахмачари'},
    {name: 'Мирянин'},
  ];
  constructor(
    private firestore: FirestoreService,
    private fb: FormBuilder
  ) {
    this.serviceForm = fb.group({
      name: ['', Validators.required],
      isRequired: false
    })
   }


  ngOnInit(): void {
    this.firestore.getServices().pipe(takeUntil(this.unsubscribeAll$)).subscribe((services) => {
      console.log(services);
      if (!services) {
        return;
      };
      this.servicesList = services;
    }); 
  }
  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  addService() {
    const form = this.serviceForm.value;
    this.servicesList.push({name: form.name, isRequired: form.isRequired});
    this.firestore.updateServices(this.servicesList);
    this.serviceForm.reset();
  }
  deleteService(service, i) {
    this.servicesList.splice(i, 1);
    this.firestore.updateServices(this.servicesList);
  }

}
