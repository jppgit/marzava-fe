import { Component } from '@angular/core';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  valorHoraH = '';
  total: any;
  constructor(private ordersService: OrdersService) {
    this.total = {
      completed: 0,
      pending: 0,
      inProgress: 0
    };
    this.ordersService.getOrderStatusCount().subscribe({
      next: (response: any) => {
        this.total = response;
      },
      error: (err) => console.error(err)
    });
    this.ordersService.getProfitOrdersMonth().subscribe({
      next: (response: any) => {
        this.valorHoraH = response.valorHoraGlobal;
      },
      error: (err) => console.error(err)
    });
  }
}
