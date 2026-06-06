import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Order {
  id: number;
  title?: string;
  description?: string;
  total: number;
  clientId: number;
  client?: { name: string };
  orderType?: { name: string };
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = `${environment.api_host}/orders`;

  constructor(private http: HttpClient) {}

  getOrders(searchText?: string, page: number = 1, limit: number = 10): Observable<PaginatedOrders | Order[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (searchText) {
      params = params.set('searchText', searchText);
    }

    return this.http.get<PaginatedOrders | Order[]>(this.apiUrl, { params });
  }

  createOrder(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateOrder(id: number, order: Partial<Order>): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}`, order);
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getProfit(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/profit`);
  }

  getOrderCosts(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/costs`);
  }




}
