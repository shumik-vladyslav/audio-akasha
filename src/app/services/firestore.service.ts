import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
// import * as firebase from 'firebase/app';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    private angularFirestore: AngularFirestore,
  ) { }

  getUsers(): Observable<User[]> {
    return this.angularFirestore.collection('users').snapshotChanges().pipe(map((actions: any) => {
      return actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return new User(id, data.name, data.role, data?.checked);
      });
    }))
  }

  addUser(user: User) {
    this.angularFirestore.collection('users').add({
      name: user.name,
      role: user.role,
      checked: user.checked
    })
  }

  deleteUser(user: User) {
    this.angularFirestore.collection('users').doc(user.id).delete().then(() => {
      console.log("deleted");
    })
  }

  updateUser(user: User) {
    this.angularFirestore.collection('users').doc(user.id).update({
      name: user.name,
      role: user.role,
      checked: user.checked
    }).then(() => {
      console.log("updated");
    })
  }

}
export class User {
  constructor(id: string, name: string, role, checked: boolean) {
    this.id = id;
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