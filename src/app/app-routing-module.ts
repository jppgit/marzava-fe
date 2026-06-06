import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Clientes } from './pages/clientes/clientes';
import { Pedidos } from './pages/pedidos/pedidos';
import { OrderTypes } from './pages/order-types/order-types';
import { Costos } from './pages/costos/costos';
import { Time } from './pages/time/time';
import { Layout } from './layout/layout';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'clientes', component: Clientes },
      { path: 'pedidos', component: Pedidos },
      { path: 'order-types', component: OrderTypes },
      { path: 'costos', component: Costos },
      { path: 'time', component: Time },

      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
