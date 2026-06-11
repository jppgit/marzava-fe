import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { TasksTypeService, TaskType } from '../../services/tasks-type.service';
import { OrdersService, Order } from '../../services/orders.service';
import { TimeService, TaskStat } from '../../services/time.service';
import { TaskTypeDialog } from './task-type-dialog/task-type-dialog';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.html',
  styleUrl: './tareas.scss',
  standalone: false
})
export class Tareas implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<TaskType>();

  orderCtrl = new FormControl();
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  statsByTask: TaskStat[] = [];
  maxMinutes = 1;

  constructor(
    private tasksTypeService: TasksTypeService,
    private ordersService: OrdersService,
    private timeService: TimeService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadTaskTypes();

    this.orderCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.trim()) {
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
    return order && order.title ? `${order.title} (ID: ${order.id})` : '';
  }

  onOrderSelected(order: Order) {
    this.selectedOrder = order;
    this.loadStatsByTask();
  }

  loadStatsByTask() {
    if (!this.selectedOrder) return;
    this.timeService.getStatsByTask(this.selectedOrder.id).subscribe(stats => {
      this.statsByTask = stats;
      this.maxMinutes = Math.max(1, ...stats.map(s => s.totalMinutes));
    });
  }

  loadTaskTypes() {
    this.tasksTypeService.findAll().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  openDialog(taskType?: TaskType) {
    const dialogRef = this.dialog.open(TaskTypeDialog, {
      width: '400px',
      data: taskType ? { ...taskType } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTaskTypes();
      }
    });
  }

  deleteTaskType(id: number) {
    if (confirm('¿Estás seguro de eliminar este tipo de tarea?')) {
      this.tasksTypeService.remove(id).subscribe(() => {
        this.loadTaskTypes();
      });
    }
  }
}
