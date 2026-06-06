import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Client {
  id: number;
  name: string;
  phone?: string;
  cityId?: number;
  address?: string;
  measurements?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedClients {
  data: Client[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private apiUrl = `${environment.api_host}/clients`;

  constructor(private http: HttpClient) {}

  getClients(searchword?: string, page: number = 1, limit: number = 10): Observable<PaginatedClients | Client[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (searchword) {
      params = params.set('searchword', searchword);
    }

    return this.http.get<PaginatedClients | Client[]>(this.apiUrl, { params });
  }

  createClient(client: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
