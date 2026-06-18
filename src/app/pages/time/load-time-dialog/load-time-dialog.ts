import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { OrdersService, Order } from '../../../services/orders.service';
import { TimeService } from '../../../services/time.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, map, startWith } from 'rxjs';
import { TasksTypeService, TaskType } from '../../../services/tasks-type.service';
import { TaskTypeDialog } from '../../tareas/task-type-dialog/task-type-dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-load-time-dialog',
  templateUrl: './load-time-dialog.html',
  styleUrl: './load-time-dialog.scss',
  standalone: false
})
export class LoadTimeDialog implements OnInit {
  orderCtrl = new FormControl(null, Validators.required);
  filteredOrders: Order[] = [];

  taskTypeCtrl = new FormControl();
  taskTypes: TaskType[] = [];
  filteredTaskTypes: TaskType[] = [];

  timeForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<LoadTimeDialog>,
    private ordersService: OrdersService,
    private timeService: TimeService,
    private tasksTypeService: TasksTypeService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.timeForm = this.fb.group({
      order: this.orderCtrl,
      taskType: this.taskTypeCtrl,
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

    this.loadTaskTypes();

    this.taskTypeCtrl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterTaskTypes(name as string) : this.taskTypes.slice();
      })
    ).subscribe(filtered => {
      this.filteredTaskTypes = filtered;
    });
  }

  loadTaskTypes() {
    this.tasksTypeService.findAll().subscribe(types => {
      this.taskTypes = types;
      // Trigger valueChanges to update the filtered list
      this.taskTypeCtrl.setValue(this.taskTypeCtrl.value);
    });
  }

  private _filterTaskTypes(name: string): TaskType[] {
    const filterValue = name.toLowerCase();
    return this.taskTypes.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  displayTaskTypeFn(taskType: TaskType): string {
    return taskType && taskType.name ? taskType.name : '';
  }

  openTaskTypeDialog() {
    const dialogRef = this.dialog.open(TaskTypeDialog, {
      width: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTaskTypes();
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
        taskTypeId: this.timeForm.value.taskType?.id || undefined
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
