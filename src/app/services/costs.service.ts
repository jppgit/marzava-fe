import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cost {
  id: number;
  concept: string;
  amount: number;
  orderId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedCosts {
  items: Cost[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CostsService {
  private apiUrl = `${environment.api_host}/costs`;

  constructor(private http: HttpClient) {}

  getCosts(searchText?: string, page: number = 1, limit: number = 10): Observable<PaginatedCosts | Cost[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (searchText) {
      params = params.set('searchword', searchText);
    }


    return this.http.get<PaginatedCosts | Cost[]>(this.apiUrl, { params });
  }

  createCost(cost: Partial<Cost>): Observable<Cost> {
    return this.http.post<Cost>(this.apiUrl, cost);
  }

  updateCost(id: number, cost: Partial<Cost>): Observable<Cost> {
    return this.http.patch<Cost>(`${this.apiUrl}/${id}`, cost);
  }

  deleteCost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
