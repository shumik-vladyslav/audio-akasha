import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { ClientComponent } from './client/client.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  {
    component: ClientComponent,
    path: "client"
  },
  {
    component: AdminComponent,
    path: "admin"
  },
  {
    component: UsersComponent,
    path: "users"
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
