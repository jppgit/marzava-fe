import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { OrderDialog } from './order-dialog/order-dialog';
import { OrdersService, Order } from '../../services/orders.service';
import { TimeService } from '../../services/time.service';

import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-pedidos',
  standalone: false,
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss'
})
export class Pedidos implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'client', 'total', 'costs', 'profit', 'totalTime', 'status', 'orderType', 'actions'];



  data: Order[] = [];
  totalRows = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  searchText = '';

  private searchSubject = new Subject<string>();

  constructor(
    public dialog: MatDialog,
    private ordersService: OrdersService,
    private timeService: TimeService
  ) {

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchText = value;
      this.currentPage = 0;
      this.loadOrders();
    });
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.ordersService.getOrders(this.searchText, this.currentPage + 1, this.pageSize)
      .subscribe({
        next: (response: any) => {
          if (response && response.items) {
            this.data = response.items;
            this.totalRows = response.total;
          } else if (Array.isArray(response)) {
            this.data = response;
            this.totalRows = response.length;
          }

          // Fetch profit, costs and time for each order
          this.data.forEach((order: any) => {
            this.ordersService.getProfit(order.id).subscribe({
              next: (profitData) => {
                order.profit = profitData.profit;
              },
              error: (err) => console.error(err)
            });

            this.ordersService.getOrderCosts(order.id).subscribe({
              next: (costsData) => {
                order.costsTotal = costsData.reduce((acc: number, cost: any) => acc + cost.amount, 0);
              },
              error: (err) => console.error(err)
            });

            this.timeService.getStats(order.id).subscribe({
              next: (stats) => {
                order.totalTime = stats.total;
              },
              error: (err) => console.error(err)
            });
          });


        },
        error: (err) => console.error(err)
      });

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  formatMinutes(minutes: number): string {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }


  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadOrders();
  }

  openDialog(order?: Order): void {
    const dialogRef = this.dialog.open(OrderDialog, {
      width: '500px',
      data: order ? { ...order } : { title: '', description: '', total: 0, clientId: null, status: 'PENDING', orderTypeId: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          console.log('Updating order with data:', result);
          this.ordersService.updateOrder(result.id, result).subscribe({
            next: () => this.loadOrders(),
            error: (err) => console.error(err)
          });
        } else {
          const { id, ...createData } = result;
          console.log('Creating order with data:', createData);
          this.ordersService.createOrder(createData).subscribe({
            next: () => this.loadOrders(),
            error: (err) => console.error(err)
          });
        }

      }
    });

  }

  deleteOrder(order: Order) {
    if (confirm(`¿Estás seguro de eliminar el pedido ${order.id}?`)) {
      this.ordersService.deleteOrder(order.id).subscribe({
        next: () => this.loadOrders(),
        error: (err) => console.error(err)
      });
    }
  }

}
