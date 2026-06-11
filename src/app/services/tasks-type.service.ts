import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TaskType {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class TasksTypeService {
  private apiUrl = `${environment.api_host}/tasks-type`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<TaskType[]> {
    return this.http.get<TaskType[]>(this.apiUrl);
  }

  findOne(id: number): Observable<TaskType> {
    return this.http.get<TaskType>(`${this.apiUrl}/${id}`);
  }

  create(data: { name: string }): Observable<TaskType> {
    return this.http.post<TaskType>(this.apiUrl, data);
  }

  update(id: number, data: { name: string }): Observable<TaskType> {
    return this.http.patch<TaskType>(`${this.apiUrl}/${id}`, data);
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
