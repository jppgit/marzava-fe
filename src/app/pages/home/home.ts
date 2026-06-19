import { Component, HostListener } from '@angular/core';
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
  availableMonths: { month: number; year: number }[] = [];
  selectedMonth: number;
  selectedYear: number;
  showPicker = false;

  private readonly MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  constructor(private ordersService: OrdersService) {
    const now = new Date();
    this.selectedMonth = now.getMonth();
    this.selectedYear = now.getFullYear();

    this.total = { completed: 0, pending: 0, inProgress: 0 };
    this.stats = {
      gananciaNeta: 0, ingresoBruto: 0, ticketPromedio: 0,
      margenGanancia: 0, pedidosMesActual: 0, pedidosMesAnterior: 0,
      pedidosCambio: null, gananciaCambio: null, clienteMasActivo: null,
    };

    this.ordersService.getAvailableMonths().subscribe({
      next: (months) => { this.availableMonths = months; },
      error: (err) => console.error(err),
    });

    this.loadData(this.selectedMonth, this.selectedYear);
  }

  loadData(month: number, year: number) {
    this.ordersService.getOrderStatusCount(month, year).subscribe({
      next: (response: any) => { this.total = response; },
      error: (err) => console.error(err),
    });
    this.ordersService.getProfitOrdersMonth(month, year).subscribe({
      next: (response: any) => { this.valorHoraH = response.valorHoraGlobal; },
      error: (err) => console.error(err),
    });
    this.ordersService.getDashboardStats(month, year).subscribe({
      next: (response: any) => { this.stats = response; },
      error: (err) => console.error(err),
    });
  }

  selectMonth(m: { month: number; year: number }) {
    this.selectedMonth = m.month;
    this.selectedYear = m.year;
    this.showPicker = false;
    this.loadData(m.month, m.year);
  }

  togglePicker(event: Event) {
    event.stopPropagation();
    this.showPicker = !this.showPicker;
  }

  @HostListener('document:click')
  closePicker() {
    this.showPicker = false;
  }

  getMesLabel(month: number, year: number): string {
    return `${this.MESES[month]} ${year}`;
  }

  getMesActual(): string {
    return this.getMesLabel(this.selectedMonth, this.selectedYear);
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
