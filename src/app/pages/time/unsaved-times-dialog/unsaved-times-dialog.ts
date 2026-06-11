import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TimeLocalStorageService, TimeRecord } from '../../../services/time-localStorage.service';
import { OrdersService, Order } from '../../../services/orders.service';

interface EnrichedTimeRecord extends TimeRecord {
  orderData?: Order;
  loading: boolean;
}


@Component({
  selector: 'app-unsaved-times-dialog',
  templateUrl: './unsaved-times-dialog.html',
  styleUrl: './unsaved-times-dialog.scss',
  standalone: false
})
export class UnsavedTimesDialog implements OnInit {
  records: EnrichedTimeRecord[] = [];

  constructor(
    public dialogRef: MatDialogRef<UnsavedTimesDialog>,
    private timeLocalStorageService: TimeLocalStorageService,
    private ordersService: OrdersService
  ) { }

  ngOnInit() {
    const rawRecords = this.timeLocalStorageService.getTimeTracks();
    this.records = rawRecords.map(r => ({ ...r, loading: true }));

    this.records.forEach(record => {
      this.ordersService.getOrder(record.orderId).subscribe({
        next: (order) => {
          record.orderData = order;
          record.loading = false;
        },
        error: () => {
          record.loading = false;
        }
      });
    });
  }

  close() {
    this.dialogRef.close();
  }
}
