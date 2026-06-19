import { Component } from '@angular/core';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  valorHoraH = 0;
  total: any;
  stats: any;

  constructor(private ordersService: OrdersService) {
    this.total = { completed: 0, pending: 0, inProgress: 0 };
    this.stats = {
      gananciaNeta: 0,
      ingresoBruto: 0,
      ticketPromedio: 0,
      margenGanancia: 0,
      pedidosMesActual: 0,
      pedidosMesAnterior: 0,
      pedidosCambio: null,
      gananciaCambio: null,
      clienteMasActivo: null,
    };

    this.ordersService.getOrderStatusCount().subscribe({
      next: (response: any) => { this.total = response; },
      error: (err) => console.error(err),
    });

    this.ordersService.getProfitOrdersMonth().subscribe({
      next: (response: any) => { this.valorHoraH = response.valorHoraGlobal; },
      error: (err) => console.error(err),
    });

    this.ordersService.getDashboardStats().subscribe({
      next: (response: any) => { this.stats = response; },
      error: (err) => console.error(err),
    });
  }

  getMesActual(): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const now = new Date();
    return `${meses[now.getMonth()]} ${now.getFullYear()}`;
  }

  getTrendClass(value: number | null): string {
    if (value === null || value === undefined) return 'trend-neutral';
    if (value > 0) return 'trend-up';
    if (value < 0) return 'trend-down';
    return 'trend-neutral';
  }

  getTrendText(value: number | null): string {
    if (value === null || value === undefined) return 'Sin datos previos';
    if (value === 0) return 'Sin cambios';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}% vs mes anterior`;
  }
}
