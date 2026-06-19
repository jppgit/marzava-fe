import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WorkTasksService, WorkTask } from '../../services/work-tasks.service';
import { OrdersService } from '../../services/orders.service';
import { TasksTypeService } from '../../services/tasks-type.service';
import { WorkTaskDialog } from './work-task-dialog/work-task-dialog';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';

interface DayInfo {
  date: Date;
  dateKey: string;
  dayName: string;
  dayNum: number;
  isToday: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: false,
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarPage implements OnInit, OnDestroy {
  viewDate = new Date();
  days: DayInfo[] = [];
  tasks: WorkTask[] = [];
  orders: any[] = [];
  taskTypes: any[] = [];

  readonly HOUR_HEIGHT = 64;
  readonly DAY_START = 8;
  readonly HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

  private readonly COLORS = [
    '#4285F4', '#EA4335', '#34A853', '#FF6D00',
    '#7B1FA2', '#00897B', '#E91E63', '#1565C0',
    '#F57C00', '#6A1B9A', '#00838F', '#AD1457',
  ];
  private colorMap = new Map<number, string>();
  private colorIdx = 0;
  private timeInterval: any;

  currentTimeTop = 0;
  currentDayKey = '';

  // ── Drag state ──────────────────────────────────────────────────────────
  dragTask: WorkTask | null = null;
  dragOffsetY = 0;
  dragOverDayKey: string | null = null;

  // ── Context menu state ──────────────────────────────────────────────────
  showContextMenu = false;
  showColorPicker = false;
  ctxMenuX = 0;
  ctxMenuY = 0;
  ctxMenuTask: WorkTask | null = null;

  readonly COLOR_PALETTE = [
    '#D50000', '#E67C73', '#F4511E', '#F6BF26',
    '#33B679', '#0B8043', '#039BE5', '#3F51B5',
    '#7986CB', '#8E24AA', '#616161', '#FF6D00',
  ];

  constructor(
    private workTasksService: WorkTasksService,
    private ordersService: OrdersService,
    private tasksTypeService: TasksTypeService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadWeek();
    this.loadSupportingData();
    this.updateCurrentTime();
    this.timeInterval = setInterval(() => this.updateCurrentTime(), 60_000);
  }

  ngOnDestroy() {
    clearInterval(this.timeInterval);
  }

  @HostListener('document:click')
  closeContextMenu() {
    this.showContextMenu = false;
    this.showColorPicker = false;
  }

  // ── Week helpers ──────────────────────────────────────────────────────────

  private getMonday(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    return d;
  }

  private toDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  private getDayName(dow: number): string {
    return ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'][dow];
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  loadWeek() {
    const monday = this.getMonday(this.viewDate);
    const today = new Date();

    this.days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return {
        date,
        dateKey: this.toDateKey(date),
        dayName: this.getDayName(date.getDay()),
        dayNum: date.getDate(),
        isToday: this.isSameDay(date, today),
      };
    });

    const weekEnd = new Date(monday);
    weekEnd.setDate(monday.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    this.workTasksService
      .getCalendar(monday.toISOString(), weekEnd.toISOString())
      .subscribe({
        next: (calendar) => { this.tasks = Object.values(calendar).flat(); },
        error: (err) => console.error(err),
      });
  }

  private loadSupportingData() {
    this.ordersService.getOrders(undefined, 1, 999).subscribe({
      next: (res: any) => {
        this.orders = Array.isArray(res) ? res : (res.items ?? []);
      },
      error: (err) => console.error(err),
    });
    this.tasksTypeService.findAll().subscribe({
      next: (types) => { this.taskTypes = types; },
      error: (err) => console.error(err),
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  prevWeek() {
    const d = new Date(this.viewDate);
    d.setDate(d.getDate() - 7);
    this.viewDate = d;
    this.loadWeek();
  }

  nextWeek() {
    const d = new Date(this.viewDate);
    d.setDate(d.getDate() + 7);
    this.viewDate = d;
    this.loadWeek();
  }

  goToToday() {
    this.viewDate = new Date();
    this.loadWeek();
  }

  getWeekLabel(): string {
    if (!this.days.length) return '';
    const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const first = this.days[0].date;
    const last  = this.days[6].date;
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()} – ${last.getDate()} ${MONTHS[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${first.getDate()} ${MONTHS[first.getMonth()]} – ${last.getDate()} ${MONTHS[last.getMonth()]} ${last.getFullYear()}`;
  }

  // ── Event helpers ─────────────────────────────────────────────────────────

  getDayTasks(dateKey: string): WorkTask[] {
    return this.tasks.filter(t => t.scheduledDate.startsWith(dateKey));
  }

  getEventStyle(task: WorkTask): any {
    const d = new Date(task.scheduledDate);
    const hours = d.getHours() + d.getMinutes() / 60;
    const top = Math.max(0, (hours - this.DAY_START) * this.HOUR_HEIGHT);
    const height = Math.max((task.estimatedHours || 1) * this.HOUR_HEIGHT, 28);
    return { top: `${top}px`, height: `${height}px` };
  }

  getTaskColor(task: WorkTask): string {
    if (task.color) return task.color;
    const { orderId } = task;
    if (!this.colorMap.has(orderId)) {
      this.colorMap.set(orderId, this.COLORS[this.colorIdx++ % this.COLORS.length]);
    }
    return this.colorMap.get(orderId)!;
  }

  getEventLabel(task: WorkTask): string {
    return task.title || task.taskType?.name || task.order?.orderType?.name || 'Tarea';
  }

  updateCurrentTime() {
    const now = new Date();
    this.currentDayKey = this.toDateKey(now);
    const hours = now.getHours() + now.getMinutes() / 60;
    this.currentTimeTop = (hours - this.DAY_START) * this.HOUR_HEIGHT;
  }

  // ── Slot / event click ────────────────────────────────────────────────────

  onSlotClick(day: DayInfo, event: MouseEvent) {
    if (this.dragTask) return;
    const col = event.currentTarget as HTMLElement;
    const rect = col.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const rawHour = clickY / this.HOUR_HEIGHT + this.DAY_START;
    const hour = Math.min(Math.floor(rawHour), 21);
    const minutes = Math.round((rawHour % 1) * 60 / 15) * 15;

    const scheduled = new Date(day.date);
    scheduled.setHours(hour, minutes >= 60 ? 45 : minutes, 0, 0);
    this.openDialog(undefined, scheduled);
  }

  onEventClick(task: WorkTask, event: MouseEvent) {
    event.stopPropagation();
    this.openDialog(task);
  }

  openDialog(task?: WorkTask, scheduledDate?: Date) {
    const ref = this.dialog.open(WorkTaskDialog, {
      width: '500px',
      data: { task, scheduledDate, orders: this.orders, taskTypes: this.taskTypes },
    });
    ref.afterClosed().subscribe(changed => {
      if (changed) this.loadWeek();
    });
  }

  // ── Context menu ──────────────────────────────────────────────────────────

  onContextMenu(task: WorkTask, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.ctxMenuTask = task;
    this.ctxMenuX = event.clientX;
    this.ctxMenuY = event.clientY;
    this.showContextMenu = true;
  }

  toggleColorPicker(event: MouseEvent) {
    event.stopPropagation();
    this.showColorPicker = !this.showColorPicker;
  }

  setTaskColor(color: string | null, event: MouseEvent) {
    event.stopPropagation();
    if (!this.ctxMenuTask) return;
    const taskId = this.ctxMenuTask.id;
    this.showContextMenu = false;
    this.showColorPicker = false;
    this.workTasksService.update(taskId, { color }).subscribe({
      next: () => this.loadWeek(),
      error: (err) => console.error(err),
    });
  }

  cloneTask(event: MouseEvent) {
    event.stopPropagation();
    if (!this.ctxMenuTask) return;
    const t = this.ctxMenuTask;
    const dto: any = {
      scheduledDate: t.scheduledDate,
      orderId: t.orderId,
      estimatedHours: t.estimatedHours,
      status: 'PENDING',
    };
    if (t.title) dto.title = t.title;
    if (t.notes) dto.notes = t.notes;
    if (t.taskTypeId) dto.taskTypeId = t.taskTypeId;

    this.workTasksService.create(dto).subscribe({
      next: () => { this.showContextMenu = false; this.loadWeek(); },
      error: (err) => console.error(err),
    });
  }

  deleteTask(event: MouseEvent) {
    event.stopPropagation();
    if (!this.ctxMenuTask) return;
    const task = this.ctxMenuTask;
    this.showContextMenu = false;

    const ref = this.dialog.open(ConfirmDialog, {
      width: '380px',
      data: {
        title: 'Eliminar tarea',
        message: `¿Eliminar "${this.getEventLabel(task)}"? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.workTasksService.remove(task.id).subscribe({
          next: () => this.loadWeek(),
          error: (err) => console.error(err),
        });
      }
    });
  }

  // ── Drag and drop ─────────────────────────────────────────────────────────

  onDragStart(task: WorkTask, event: DragEvent) {
    event.stopPropagation();
    this.dragTask = task;
    const el = event.currentTarget as HTMLElement;
    this.dragOffsetY = event.clientY - el.getBoundingClientRect().top;
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragEnd() {
    this.dragTask = null;
    this.dragOverDayKey = null;
  }

  onDragOver(day: DayInfo, event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.dragOverDayKey = day.dateKey;
  }

  onDragLeave(day: DayInfo, event: DragEvent) {
    const col = event.currentTarget as HTMLElement;
    if (!col.contains(event.relatedTarget as Node)) {
      if (this.dragOverDayKey === day.dateKey) {
        this.dragOverDayKey = null;
      }
    }
  }

  onDrop(day: DayInfo, event: DragEvent) {
    event.preventDefault();
    if (!this.dragTask) return;

    const col = event.currentTarget as HTMLElement;
    const rect = col.getBoundingClientRect();
    const adjustedY = event.clientY - rect.top - this.dragOffsetY;
    const rawHour = adjustedY / this.HOUR_HEIGHT + this.DAY_START;

    let hour = Math.floor(rawHour);
    let minutes = Math.round((rawHour % 1) * 60 / 15) * 15;
    if (minutes >= 60) { minutes = 0; hour++; }
    hour = Math.min(Math.max(hour, this.DAY_START), 21);

    const newDate = new Date(day.date);
    newDate.setHours(hour, minutes, 0, 0);

    const taskId = this.dragTask.id;
    this.dragTask = null;
    this.dragOverDayKey = null;

    this.workTasksService.update(taskId, { scheduledDate: newDate.toISOString() }).subscribe({
      next: () => this.loadWeek(),
      error: (err) => console.error(err),
    });
  }
}
