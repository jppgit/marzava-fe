import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LoadTimeDialog } from './load-time-dialog/load-time-dialog';
import { UnsavedTimesDialog } from './unsaved-times-dialog/unsaved-times-dialog';
import { TasksTypeService, TaskType } from '../../services/tasks-type.service';
import { OrdersService, Order } from '../../services/orders.service';
import { TimeService, TimeStats } from '../../services/time.service';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { TimeLocalStorageService } from '../../services/time-localStorage.service';

interface ActiveTimerState {
  startTimestamp: number;
  orderId: number;
  orderTitle: string;
  taskTypeId: number | null;
}

@Component({
  selector: 'app-time',
  standalone: false,
  templateUrl: './time.html',
  styleUrl: './time.scss'
})
export class Time implements OnInit, OnDestroy {
  orderCtrl = new FormControl();
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;

  // Timer state
  isPlaying = false;
  timerValue = 0; // in seconds
  displayTime = '00:00:00';
  private timerInterval: any;
  private timerStartTimestamp: number | null = null;
  private readonly ACTIVE_TIMER_KEY = 'activeTimer';

  // Stats
  stats: TimeStats = { today: 0, total: 0 };

  needsToSaveTimes = false;

  taskTypes: TaskType[] = [];
  selectedTaskTypeId: number | null = null;

  private visibilityChangeHandler = () => {
    if (!document.hidden && this.isPlaying && this.timerStartTimestamp) {
      this.timerValue = Math.floor((Date.now() - this.timerStartTimestamp) / 1000);
      this.updateDisplayTime();
    }
  };

  constructor(
    private ordersService: OrdersService,
    private timeService: TimeService,
    private timeLocalStorageService: TimeLocalStorageService,
    private tasksTypeService: TasksTypeService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.needsToSaveTimes = this.timeLocalStorageService.existsTimeTracks();
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

    this.tasksTypeService.findAll().subscribe(types => {
      this.taskTypes = types;
    });

    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    this.restoreActiveTimer();
  }

  saveTimes() {
    const timesToSave = this.timeLocalStorageService.getTimeTracks();
    timesToSave.forEach((time, index) => {
      this.timeService.createTime(time).subscribe({
        next: () => {
          if (index === timesToSave.length - 1) {
            this.timeLocalStorageService.clearTimeTracks(index);
            this.needsToSaveTimes = false;
          }
        },
        error: (err) => console.error(err)
      });
    });
  }

  ngOnDestroy() {
    this.stopTimer();
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  displayFn(order: Order): string {
    return order && order.title ? order.title : '';
  }

  onOrderSelected(order: Order) {
    this.selectedOrder = order;
    this.loadStats();
  }

  loadStats() {
    if (this.selectedOrder) {
      this.timeService.getStats(this.selectedOrder.id).subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (err) => console.error(err)
      });
    }
  }

  toggleTimer() {
    if (!this.selectedOrder) {
      alert('Por favor selecciona un pedido primero');
      return;
    }

    if (this.isPlaying) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.timerStartTimestamp = Date.now() - this.timerValue * 1000;
    this.isPlaying = true;
    this.saveActiveTimerState();
    this.timerInterval = setInterval(() => {
      this.timerValue = Math.floor((Date.now() - this.timerStartTimestamp!) / 1000);
      this.updateDisplayTime();
    }, 1000);
  }

  pauseTimer() {
    if (this.timerStartTimestamp) {
      this.timerValue = Math.floor((Date.now() - this.timerStartTimestamp) / 1000);
    }
    this.isPlaying = false;
    this.stopTimer();
    this.clearActiveTimerState();

    const minutes = this.timerValue / 60;
    if (this.selectedOrder) {
      this.timeService.createTime({
        minutes: minutes,
        orderId: this.selectedOrder.id,
        taskTypeId: this.selectedTaskTypeId ? this.selectedTaskTypeId : undefined
      }).subscribe({
        next: () => {
          this.loadStats();
          this.timerValue = 0;
          this.updateDisplayTime();
        },
        error: () => {
          this.timeLocalStorageService.saveTimeTrack({
            minutes: minutes,
            orderId: this.selectedOrder!.id,
            taskTypeId: this.selectedTaskTypeId ? this.selectedTaskTypeId : undefined,
            createdAt: new Date().toISOString()
          });
          this.needsToSaveTimes = true;
          this.timerValue = 0;
          this.updateDisplayTime();
        }
      });
    }
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerStartTimestamp = null;
  }

  private saveActiveTimerState() {
    if (!this.selectedOrder || !this.timerStartTimestamp) return;
    const state: ActiveTimerState = {
      startTimestamp: this.timerStartTimestamp,
      orderId: this.selectedOrder.id,
      orderTitle: this.selectedOrder.title ?? '',
      taskTypeId: this.selectedTaskTypeId
    };
    localStorage.setItem(this.ACTIVE_TIMER_KEY, JSON.stringify(state));
  }

  private clearActiveTimerState() {
    localStorage.removeItem(this.ACTIVE_TIMER_KEY);
  }

  private restoreActiveTimer() {
    const saved = localStorage.getItem(this.ACTIVE_TIMER_KEY);
    if (!saved) return;
    const state: ActiveTimerState = JSON.parse(saved);
    this.selectedOrder = { id: state.orderId, title: state.orderTitle } as Order;
    this.orderCtrl.setValue(this.selectedOrder, { emitEvent: false });
    this.selectedTaskTypeId = state.taskTypeId;
    this.timerStartTimestamp = state.startTimestamp;
    this.timerValue = Math.floor((Date.now() - this.timerStartTimestamp) / 1000);
    this.updateDisplayTime();
    this.isPlaying = true;
    this.timerInterval = setInterval(() => {
      this.timerValue = Math.floor((Date.now() - this.timerStartTimestamp!) / 1000);
      this.updateDisplayTime();
    }, 1000);
    this.loadStats();
  }

  updateDisplayTime() {
    const hours = Math.floor(this.timerValue / 3600);
    const minutes = Math.floor((this.timerValue % 3600) / 60);
    const seconds = this.timerValue % 60;

    this.displayTime = [hours, minutes, seconds]
      .map(v => v < 10 ? '0' + v : v)
      .join(':');
  }

  formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  }

  openLoadTimeDialog() {
    const dialogRef = this.dialog.open(LoadTimeDialog, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.selectedOrder) {
        this.loadStats();
      }
    });
  }

  openUnsavedTimesDialog() {
    this.dialog.open(UnsavedTimesDialog, {
      width: '600px',
      maxHeight: '90vh'
    });
  }
}
