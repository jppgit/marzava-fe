import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TimeService, TaskStat } from '../../../services/time.service';
import { HORA_SALARIO_MINIMO } from '../../../constants';

@Component({
  selector: 'app-order-stats-dialog',
  templateUrl: './order-stats-dialog.html',
  styleUrls: ['./order-stats-dialog.scss'],
  standalone: false
})
export class OrderStatsDialog implements OnInit {
  taskStats: TaskStat[] = [];
  loading = true;
  totalMinutes = 0;
  maxMinutes = 0;
  valorHora = 0;
  colorClass = '';
  horaSalarioMinimo = HORA_SALARIO_MINIMO;

  constructor(
    public dialogRef: MatDialogRef<OrderStatsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private timeService: TimeService
  ) {
    if (data.totalTime && data.totalTime > 0) {
      let horas = data.totalTime / 60;
      if (horas < 1) horas = 1; // Mínimo 1 hora para el cálculo
      this.valorHora = data.profit / horas;
    }

    if (this.valorHora < HORA_SALARIO_MINIMO) {
      this.colorClass = 'red-text';
    } else if (this.valorHora > HORA_SALARIO_MINIMO * 1.35) {
      this.colorClass = 'green-text';
    } else {
      this.colorClass = 'yellow-text';
    }
  }

  ngOnInit(): void {
    this.timeService.getStatsByTask(this.data.id).subscribe({
      next: (stats) => {
        this.taskStats = stats;
        this.totalMinutes = stats.reduce((acc, stat) => acc + stat.totalMinutes, 0);
        this.maxMinutes = Math.max(...stats.map(s => s.totalMinutes), 1); // prevent division by zero
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getBarWidth(minutes: number): number {
    if (this.maxMinutes === 0) return 0;
    return (minutes / this.maxMinutes) * 100;
  }

  formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
}
