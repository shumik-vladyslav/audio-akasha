import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
// import * as firebase from 'firebase/app';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  userList$: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor(
    private angularFirestore: AngularFirestore,
  ) { }

  getUsers(): Observable<User[]> {
    return this.angularFirestore.collection('users').snapshotChanges().pipe(map((actions: any) => {
      let data = actions.find(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        if(data?.users) {
          return  data.users;
          
        }

      });
      data =  data.payload.doc.data() as any;

      
      return data?.users
    }))
  };

  getServices(): Observable<any> {
    return this.angularFirestore.collection('users').snapshotChanges().pipe(map((actions: any) => {
      let data = actions.find(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        if(data?.services) {
          return  data.services;
          
        }

      });
      data =  data.payload.doc.data() as any;

      
      return data?.services
    }))
  };
  updateServices(services) {
    this.angularFirestore.collection('users').doc('servicesData').update({services});
  }

  addUser(users) {
    this.angularFirestore.collection('users').doc('usersData').update({users})
  }

  deleteUser(users) {
    this.angularFirestore.collection('users').doc('usersData').update({users})
  }

  updateUser(users) {
    this.angularFirestore.collection('users').doc('usersData').update({users})
  }

}
export class User {
  constructor(name: string, role, checked: boolean) {

    this.name = name;
    this.role = role;
    this.checked = checked;
  }
  id: string;
  name: string;
  role: Role;
  checked: boolean;
}
// монах, послушник, кандидат, брахмачари, мирянин
export enum Role {
  Monk = "Монах",
  Novice = "Послушник",
  Candidate = "Кандидат",
  Brahmachari = "Брахмачари",
  Laymar = "Мирянин",
  Test = 'test'
}