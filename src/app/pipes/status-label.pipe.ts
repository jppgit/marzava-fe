import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: false
})
export class StatusLabelPipe implements PipeTransform {
  private labels: Record<string, string> = {
    'PENDING': 'Pending',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled',
  };

  transform(value: string): string {
    return this.labels[value] ?? value;
  }
}
