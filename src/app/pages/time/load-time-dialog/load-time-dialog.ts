import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { OrdersService, Order } from '../../../services/orders.service';
import { TimeService } from '../../../services/time.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-load-time-dialog',
  templateUrl: './load-time-dialog.html',
  styleUrl: './load-time-dialog.scss',
  standalone: false
})
export class LoadTimeDialog implements OnInit {
  orderCtrl = new FormControl(null, Validators.required);
  filteredOrders: Order[] = [];

  timeForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<LoadTimeDialog>,
    private ordersService: OrdersService,
    private timeService: TimeService,
    private fb: FormBuilder
  ) {
    this.timeForm = this.fb.group({
      order: this.orderCtrl,
      timeValue: [null, [Validators.required, Validators.min(0.1)]],
      timeUnit: ['hs', Validators.required]
    });
  }

  ngOnInit() {
    this.orderCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value + "".trim()) {
          return this.ordersService.getOrders(value, 1, 10);
        } else {
          return of({ items: [] });
        }
      })
    ).subscribe((response: any) => {
      if (response && response.items) {
        this.filteredOrders = response.items;
      }
    });
  }

  displayFn(order: Order): string {
    return order && order.title ? order.title : '';
  }

  onSave() {
    if (this.timeForm.valid) {
      const order = this.timeForm.value.order as Order;
      if (!order || !order.id) return;

      let minutes = this.timeForm.value.timeValue;
      if (this.timeForm.value.timeUnit === 'hs') {
        minutes = minutes * 60;
      }

      this.timeService.createTime({
        minutes: minutes,
        orderId: order.id,
      }).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          this.dialogRef.close(false);
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
