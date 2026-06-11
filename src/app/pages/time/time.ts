import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OrdersService, Order } from '../../services/orders.service';
import { TimeService, TimeStats } from '../../services/time.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { TimeLocalStorageService } from '../../services/time-localStorage.service';

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

  // Stats
  stats: TimeStats = { today: 0, total: 0 };

  needsToSaveTimes = false;

  constructor(
    private ordersService: OrdersService,
    private timeService: TimeService,
    private timeLocalStorageService: TimeLocalStorageService
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
    this.isPlaying = true;
    this.timerInterval = setInterval(() => {
      this.timerValue++;
      this.updateDisplayTime();
    }, 1000);
  }

  pauseTimer() {
    this.isPlaying = false;
    this.stopTimer();

    // Send time to API
    const minutes = this.timerValue / 60;
    if (minutes > 0) {
      this.timeService.createTime({
        minutes: minutes,
        orderId: this.selectedOrder!.id,
      }).subscribe({
        next: () => {
          this.loadStats();
          this.timerValue = 0;
          this.updateDisplayTime();
        },
        error: (err) => {
          this.timeLocalStorageService.saveTimeTrack({
            minutes: minutes,
            orderId: this.selectedOrder!.id,
            createdAt: new Date().toISOString()
          });
        }
      });
    }
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
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
}
