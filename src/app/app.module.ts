import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatMenuModule } from '@angular/material/menu';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogEditDialog } from './dialog-edit/dialog-edit.component';
import { MatSelectModule } from '@angular/material/select';
import { ClientComponent } from './client/client.component';
import { AdminComponent } from './admin/admin.component';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilterPipe } from './filter.pipe';

import { AngularFireModule } from "@angular/fire";
import { AngularFireAnalyticsModule } from "@angular/fire/analytics";
import { AngularFirestoreModule } from "@angular/fire/firestore";
// import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';        
// import { getAuth, provideAuth } from '@angular/fire/auth';        
// import { getFirestore, provideFirestore } from '@angular/fire/firestore';        
// import { getStorage, provideStorage } from '@angular/fire/storage';        
// import { getAnalytics, provideAnalytics } from '@angular/fire/analytics'; 

import { UsersComponent } from './users/users.component';
export const firebaseConfig = {
  apiKey: "AIzaSyAS1JBSZnqIXE_XWUALKnCowDY2coJEeNE",
  authDomain: "audio-akasha.firebaseapp.com",
  projectId: "audio-akasha",
  storageBucket: "audio-akasha.appspot.com",
  messagingSenderId: "849398704426",
  appId: "1:849398704426:web:684cc0331984e339009653"
};
@NgModule({
  declarations: [
    AppComponent,
    FilterPipe,
    AdminComponent,
    ClientComponent,
    AudioPlayerComponent,
    DialogEditDialog,
    UsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    ReactiveFormsModule,
    AngularFireAnalyticsModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(firebaseConfig),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
