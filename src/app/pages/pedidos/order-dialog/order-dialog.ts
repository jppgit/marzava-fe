import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClientsService, Client } from '../../../services/clients.service';
import { OrderTypesService, OrderType } from '../../../services/order-types.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-order-dialog',
  standalone: false,
  templateUrl: './order-dialog.html',
  styleUrl: './order-dialog.scss'
})
export class OrderDialog implements OnInit {
  form: FormGroup;
  isEdit: boolean;
  clientCtrl = new FormControl();
  orderTypeCtrl = new FormControl();

  filteredClients: Client[] = [];
  filteredOrderTypes: OrderType[] = [];

  statuses = ['PENDING', 'COMPLETED', 'CANCELLED'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<OrderDialog>,
    private clientsService: ClientsService,
    private orderTypesService: OrderTypesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEdit = !!data.id;
    this.form = this.fb.group({
      id: [data.id],
      title: [data.title, Validators.required],
      description: [data.description],
      total: [data.total || 0, [Validators.required, Validators.min(0)]],
      clientId: [data.clientId, Validators.required],
      orderTypeId: [data.orderTypeId, Validators.required],
      status: [data.status || 'PENDING', Validators.required]
    });
  }

  ngOnInit() {
    if (this.isEdit && this.data.client) {
      this.clientCtrl.setValue(this.data.client);
    }
    if (this.isEdit && this.data.orderType) {
      this.orderTypeCtrl.setValue(this.data.orderType);
    }

    // Client Autocomplete
    this.clientCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string') {
          return this.clientsService.getClients(value, 1, 10);
        } else {
          return of({ items: [] });
        }
      })
    ).subscribe((response: any) => {
      if (response && response.items) {
        this.filteredClients = response.items;
      }
    });

    // Order Type Autocomplete
    this.orderTypeCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string') {
          return this.orderTypesService.getOrderTypes(value, 1, 10);
        } else {
          return of({ items: [] });
        }
      })
    ).subscribe((response: any) => {
      if (response && response.items) {
        this.filteredOrderTypes = response.items;
      }
    });

    // Handle clearing inputs
    this.clientCtrl.valueChanges.subscribe(value => {
      if (!value) {
        this.form.patchValue({ clientId: null });
      }
    });

    this.orderTypeCtrl.valueChanges.subscribe(value => {
      if (!value) {
        this.form.patchValue({ orderTypeId: null });
      }
    });
  }

  displayFn(client: Client): string {
    return client && client.name ? client.name : '';
  }

  displayOrderTypeFn(orderType: OrderType): string {
    return orderType && orderType.name ? orderType.name : '';
  }

  onClientSelected(client: Client) {
    this.form.patchValue({ clientId: client.id });
  }

  onOrderTypeSelected(orderType: OrderType) {
    this.form.patchValue({ orderTypeId: orderType.id });
  }

  onSave(): void {
    if (this.form.valid) {
      console.log('Dialog form value on save:', this.form.value);
      this.dialogRef.close(this.form.value);
    }
  }


  onCancel(): void {
    this.dialogRef.close();
  }
}
