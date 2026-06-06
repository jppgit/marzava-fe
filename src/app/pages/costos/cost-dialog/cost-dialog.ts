import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrdersService, Order } from '../../../services/orders.service';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-cost-dialog',
  standalone: false,
  templateUrl: './cost-dialog.html',
  styleUrl: './cost-dialog.scss'
})
export class CostDialog implements OnInit {
  form: FormGroup;
  isEdit: boolean;

  // Autocomplete de pedido
  orderSearch = new FormControl('');
  filteredOrders: Order[] = [];
  isLoadingOrders = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CostDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ordersService: OrdersService
  ) {
    this.isEdit = !!data.id;

    this.form = this.fb.group({
      id: [data.id],
      orderId: [data.orderId, Validators.required],
      costs: this.fb.array(
        this.isEdit
          ? [this.createCostRow(data.concept, data.amount)]
          : [this.createCostRow()]
      )
    });
  }

  ngOnInit(): void {
    // Pre-cargar label si es edición
    if (this.data.orderId && this.data.order) {
      const o = this.data.order;
      this.orderSearch.setValue(`${o.client?.name ?? ''} - ${o.title ?? ''}`);
    } else if (this.data.orderId) {
      this.orderSearch.setValue(`Pedido #${this.data.orderId}`);
    }

    // Búsqueda con debounce
    this.orderSearch.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || (value as string).length < 1) return of({ items: [], total: 0 });
        this.isLoadingOrders = true;
        return this.ordersService.getOrders(value as string, 1, 20);
      })
    ).subscribe({
      next: (response: any) => {
        this.isLoadingOrders = false;
        this.filteredOrders = response?.items ?? (Array.isArray(response) ? response : []);
      },
      error: () => { this.isLoadingOrders = false; this.filteredOrders = []; }
    });
  }

  // ── FormArray helpers ──────────────────────────────────────────────

  createCostRow(concept = '', amount: number = 0): FormGroup {
    return this.fb.group({
      concept: [concept, Validators.required],
      amount: [amount, [Validators.required, Validators.min(0)]]
    });
  }

  get costsArray(): FormArray {
    return this.form.get('costs') as FormArray;
  }

  addCostRow(): void {
    this.costsArray.push(this.createCostRow());
  }

  removeCostRow(index: number): void {
    if (this.costsArray.length > 1) {
      this.costsArray.removeAt(index);
    }
  }

  // ── Autocomplete ───────────────────────────────────────────────────

  getOptionLabel = (order: Order | string | null): string => {
    if (!order) return '';
    if (typeof order === 'string') return order;
    return `${order.client?.name ?? '(sin cliente)'} - ${order.title ?? `Pedido #${order.id}`}`;
  };

  onOrderSelected(order: Order): void {
    this.form.patchValue({ orderId: order.id });
  }

  // ── Submit ─────────────────────────────────────────────────────────

  getTotalAmount(): number {
    return this.costsArray.controls.reduce((sum, ctrl) => sum + (ctrl.get('amount')?.value || 0), 0);
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
