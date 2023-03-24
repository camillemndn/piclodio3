import { BrowserModule } from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TopBarComponent } from './top-bar/top-bar.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomepageComponent } from './homepage/homepage.component';
import { globalVariables } from '../globalVariables';
import { WebradioComponent } from './webradio/webradio.component';
import { WebradioFormComponent } from './webradio-form/webradio-form.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AlarmsComponent } from './alarms/alarms.component';
import { AlarmFormComponent } from './alarm-form/alarm-form.component';
import { ModalConfirmDeletionComponent } from './modal-confirm-deletion/modal-confirm-deletion.component';
import { SettingsComponent } from './settings/settings.component';
import { ToastsContainer } from './toast-container.component';
import { ServiceWorkerModule } from '@angular/service-worker';


@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    HomepageComponent,
    WebradioComponent,
    WebradioFormComponent,
    AlarmsComponent,
    AlarmFormComponent,
    ModalConfirmDeletionComponent,
    SettingsComponent,
    ToastsContainer
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    RouterModule.forRoot([
    { path: '', component: HomepageComponent },
    {
        path: 'webradios',
        component: WebradioComponent
    },
    {
        path: 'webradios/new',
        component: WebradioFormComponent
    },
    {
        path: 'webradios/:id',
        component: WebradioFormComponent
    },
    {
        path: 'alarms',
        component: AlarmsComponent
    },
    {
        path: 'alarms/new',
        component: AlarmFormComponent
    },
    {
        path: 'alarms/:id',
        component: AlarmFormComponent
    },
    {
        path: 'settings',
        component: SettingsComponent
    },
], {}),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [globalVariables],
  bootstrap: [AppComponent]
})
export class AppModule { }
