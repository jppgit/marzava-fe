import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WorkTask {
  id: number;
  title?: string;
  notes?: string;
  status: string;
  scheduledDate: string;
  originalScheduledDate?: string;
  estimatedHours?: number;
  orderId: number;
  order?: {
    id: number;
    client?: { name: string };
    orderType?: { name: string };
  };
  taskTypeId?: number;
  taskType?: { id: number; name: string };
  color?: string | null;
}

@Injectable({ providedIn: 'root' })
export class WorkTasksService {
  private apiUrl = `${environment.api_host}/work-tasks`;

  constructor(private http: HttpClient) {}

  getCalendar(weekStart: string, weekEnd: string): Observable<Record<string, WorkTask[]>> {
    const params = new HttpParams()
      .set('weekStart', weekStart)
      .set('weekEnd', weekEnd);
    return this.http.get<Record<string, WorkTask[]>>(`${this.apiUrl}/calendar`, { params });
  }

  create(dto: any): Observable<WorkTask> {
    return this.http.post<WorkTask>(this.apiUrl, dto);
  }

  update(id: number, dto: any): Observable<WorkTask> {
    return this.http.patch<WorkTask>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
