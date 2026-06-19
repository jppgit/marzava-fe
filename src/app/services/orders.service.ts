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

  constructor(private http: HttpClient) { }

  getOrders(searchText?: string, page: number = 1, limit: number = 10, status?: string): Observable<PaginatedOrders | Order[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (searchText) {
      params = params.set('searchText', searchText);
    }
    
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedOrders | Order[]>(this.apiUrl, { params });
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
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

  getProfitOrdersMonth(month?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (month !== undefined) params = params.set('month', month.toString());
    if (year !== undefined) params = params.set('year', year.toString());
    return this.http.get(`${this.apiUrl}/profit-orders-month`, { params });
  }

  getOrderStatusCount(month?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (month !== undefined) params = params.set('month', month.toString());
    if (year !== undefined) params = params.set('year', year.toString());
    return this.http.get(`${this.apiUrl}/order-status-count`, { params });
  }

  getDashboardStats(month?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (month !== undefined) params = params.set('month', month.toString());
    if (year !== undefined) params = params.set('year', year.toString());
    return this.http.get(`${this.apiUrl}/dashboard-stats`, { params });
  }

  getAvailableMonths(): Observable<{ month: number; year: number }[]> {
    return this.http.get<{ month: number; year: number }[]>(`${this.apiUrl}/available-months`);
  }
}
