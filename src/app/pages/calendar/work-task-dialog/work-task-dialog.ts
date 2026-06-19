import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorkTasksService, WorkTask } from '../../../services/work-tasks.service';

export interface WorkTaskDialogData {
  task?: WorkTask;
  scheduledDate?: Date;
  orders: any[];
  taskTypes: any[];
}

@Component({
  selector: 'app-work-task-dialog',
  standalone: false,
  templateUrl: './work-task-dialog.html',
  styles: [`
    .task-form { display: flex; flex-direction: column; gap: 2px; }
    .full-width { width: 100%; }
    .row-fields { display: flex; gap: 12px; }
    .row-fields mat-form-field { flex: 1; min-width: 0; }
    mat-dialog-content { min-width: 440px; padding-top: 8px !important; }
    .color-row { display: flex; align-items: center; gap: 10px; padding: 4px 0 12px; }
    .color-row-label { font-size: 0.78rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
    .color-swatches { display: flex; flex-wrap: wrap; gap: 7px; }
    .dlg-swatch { width: 24px; height: 24px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: transform 0.12s; box-sizing: border-box; }
    .dlg-swatch:hover { transform: scale(1.2); }
    .dlg-swatch.selected { outline: 2px solid #1a73e8; outline-offset: 2px; }
    .dlg-swatch-clear { background: #f1f5f9; border: 1.5px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; font-weight: 700; }
    .dlg-swatch-clear.selected { outline: 2px solid #1a73e8; outline-offset: 2px; }
  `],
})
export class WorkTaskDialog implements OnInit {
  form!: FormGroup;
  isEditing = false;

  orderCtrl = new FormControl<any>('');
  taskTypeCtrl = new FormControl<any>('');
  filteredOrders: any[] = [];
  filteredTaskTypes: any[] = [];

  readonly COLOR_PALETTE = [
    '#D50000', '#E67C73', '#F4511E', '#F6BF26',
    '#33B679', '#0B8043', '#039BE5', '#3F51B5',
    '#7986CB', '#8E24AA', '#616161', '#FF6D00',
  ];

  constructor(
    private fb: FormBuilder,
    private workTasksService: WorkTasksService,
    private dialogRef: MatDialogRef<WorkTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: WorkTaskDialogData,
  ) {}

  ngOnInit() {
    this.isEditing = !!this.data.task;
    const task = this.data.task;
    const date = task
      ? new Date(task.scheduledDate)
      : (this.data.scheduledDate || new Date());

    this.form = this.fb.group({
      title: [task?.title || ''],
      notes: [task?.notes || ''],
      orderId: [task?.orderId || null, Validators.required],
      taskTypeId: [task?.taskTypeId || null],
      date: [this.toDateStr(date), Validators.required],
      time: [this.toTimeStr(date), Validators.required],
      estimatedHours: [task?.estimatedHours ?? 1, [Validators.required, Validators.min(0.25)]],
      status: [task?.status || 'PENDING'],
      color: [task?.color || null],
    });

    this.filteredOrders = [...this.data.orders];
    this.filteredTaskTypes = [...this.data.taskTypes];

    if (task?.orderId) {
      const order = this.data.orders.find(o => o.id === task.orderId);
      if (order) this.orderCtrl.setValue(order);
    }
    if (task?.taskTypeId) {
      const taskType = this.data.taskTypes.find(t => t.id === task.taskTypeId);
      if (taskType) this.taskTypeCtrl.setValue(taskType);
    }

    this.orderCtrl.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.filteredOrders = this.filterOrders(value);
        if (!value) this.form.patchValue({ orderId: null });
      }
    });

    this.taskTypeCtrl.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.filteredTaskTypes = this.filterTaskTypes(value);
        if (!value) this.form.patchValue({ taskTypeId: null });
      }
    });
  }

  private filterOrders(text: string): any[] {
    const q = text.toLowerCase();
    return this.data.orders.filter(o =>
      (o.client?.name || '').toLowerCase().includes(q) ||
      (o.orderType?.name || '').toLowerCase().includes(q) ||
      (o.title || '').toLowerCase().includes(q),
    );
  }

  private filterTaskTypes(text: string): any[] {
    const q = text.toLowerCase();
    return this.data.taskTypes.filter(t => t.name.toLowerCase().includes(q));
  }

  displayOrderFn(order: any): string {
    if (!order) return '';
    const type = order.orderType?.name || 'Pedido';
    const client = order.client?.name || '';
    return client ? `${type} — ${client}` : type;
  }

  displayTaskTypeFn(taskType: any): string {
    return taskType?.name || '';
  }

  onOrderSelected(order: any) {
    this.form.patchValue({ orderId: order.id });
  }

  onTaskTypeSelected(taskType: any) {
    this.form.patchValue({ taskTypeId: taskType.id });
  }

  private toDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private toTimeStr(d: Date): string {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const scheduledDate = new Date(`${v.date}T${v.time}:00`).toISOString();

    const dto: any = {
      scheduledDate,
      orderId: +v.orderId,
      estimatedHours: +v.estimatedHours,
      status: v.status,
    };
    if (v.title?.trim()) dto.title = v.title.trim();
    if (v.notes?.trim()) dto.notes = v.notes.trim();
    if (v.taskTypeId) dto.taskTypeId = +v.taskTypeId;
    dto.color = v.color ?? null;

    const call = this.isEditing
      ? this.workTasksService.update(this.data.task!.id, dto)
      : this.workTasksService.create(dto);

    call.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error(err),
    });
  }

  delete() {
    if (!confirm('¿Eliminar esta tarea?')) return;
    this.workTasksService.remove(this.data.task!.id).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error(err),
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
