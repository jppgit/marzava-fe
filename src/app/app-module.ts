import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Clientes } from './pages/clientes/clientes';
import { Pedidos } from './pages/pedidos/pedidos';
import { Layout } from './layout/layout';
import { ClientDialog } from './pages/clientes/client-dialog/client-dialog';
import { OrderDialog } from './pages/pedidos/order-dialog/order-dialog';
import { StatusDialog } from './pages/pedidos/status-dialog/status-dialog';
import { StatusLabelPipe } from './pipes/status-label.pipe';
import { OrderTypes } from './pages/order-types/order-types';
import { OrderTypeDialog } from './pages/order-types/order-type-dialog/order-type-dialog';
import { Costos } from './pages/costos/costos';
import { CostDialog } from './pages/costos/cost-dialog/cost-dialog';
import { Time } from './pages/time/time';
import { LoadTimeDialog } from './pages/time/load-time-dialog/load-time-dialog';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { NotificationInterceptor } from './interceptors/notification.interceptor';
import { ClientMeasurements } from './components/client-measurements/client-measurements';




@NgModule({
  declarations: [
    App,
    Login,
    Home,
    Clientes,
    Pedidos,
    Layout,
    ClientDialog,
    OrderDialog,
    StatusDialog,
    StatusLabelPipe,
    OrderTypes,
    OrderTypeDialog,
    Costos,
    CostDialog,
    Time,
    LoadTimeDialog
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatRippleModule,
    ClientMeasurements,
    MatButtonModule,
    MatSnackBarModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: NotificationInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
