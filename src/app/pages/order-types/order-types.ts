import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { OrderTypeDialog } from './order-type-dialog/order-type-dialog';
import { OrderTypesService, OrderType } from '../../services/order-types.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-order-types',
  standalone: false,
  templateUrl: './order-types.html',
  styleUrl: './order-types.scss'
})
export class OrderTypes implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  data: OrderType[] = [];
  totalRows = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  searchText = '';

  private searchSubject = new Subject<string>();

  constructor(
    public dialog: MatDialog,
    private orderTypesService: OrderTypesService
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchText = value;
      this.currentPage = 0;
      this.loadOrderTypes();
    });
  }

  ngOnInit() {
    this.loadOrderTypes();
  }

  loadOrderTypes() {
    this.orderTypesService.getOrderTypes(this.searchText, this.currentPage + 1, this.pageSize)
      .subscribe({
        next: (response: any) => {
          if (response && response.items) {
            this.data = response.items;
            this.totalRows = response.total;
          } else if (Array.isArray(response)) {
            this.data = response;
            this.totalRows = response.length;
          }
        },
        error: (err) => console.error(err)
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue.trim());
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadOrderTypes();
  }

  openDialog(orderType?: OrderType): void {
    const dialogRef = this.dialog.open(OrderTypeDialog, {
      width: '400px',
      data: orderType ? { ...orderType } : { name: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.orderTypesService.updateOrderType(result.id, result).subscribe({
            next: () => this.loadOrderTypes(),
            error: (err) => console.error(err)
          });
        } else {
          const { id, ...createData } = result;
          this.orderTypesService.createOrderType(createData).subscribe({
            next: () => this.loadOrderTypes(),
            error: (err) => console.error(err)
          });
        }

      }
    });
  }


  deleteOrderType(orderType: OrderType) {
    if (confirm(`¿Estás seguro de eliminar el tipo de orden ${orderType.name}?`)) {
      this.orderTypesService.deleteOrderType(orderType.id).subscribe({
        next: () => this.loadOrderTypes(),
        error: (err) => console.error(err)
      });
    }
  }

}
