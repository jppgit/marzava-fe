import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TimeRecord {
  id?: number;
  minutes: number;
  orderId: number;
  taskName?: string;
  createdAt?: string;
}

export interface TimeStats {
  today: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private apiUrl = `${environment.api_host}/times`;

  constructor(private http: HttpClient) {}

  createTime(data: TimeRecord): Observable<TimeRecord> {
    return this.http.post<TimeRecord>(this.apiUrl, data);
  }

  getStats(orderId: number): Observable<TimeStats> {
    const params = new HttpParams().set('orderId', orderId.toString());
    return this.http.get<TimeStats>(`${this.apiUrl}/stats`, { params });
  }
}
