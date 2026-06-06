import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderType {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedOrderTypes {
  items: OrderType[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderTypesService {
  private apiUrl = `${environment.api_host}/order-types`;

  constructor(private http: HttpClient) {}

  getOrderTypes(searchText?: string, page: number = 1, limit: number = 10): Observable<PaginatedOrderTypes | OrderType[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (searchText) {
      params = params.set('searchText', searchText);
    }

    return this.http.get<PaginatedOrderTypes | OrderType[]>(this.apiUrl, { params });
  }

  createOrderType(orderType: Partial<OrderType>): Observable<OrderType> {
    return this.http.post<OrderType>(this.apiUrl, orderType);
  }

  updateOrderType(id: number, orderType: Partial<OrderType>): Observable<OrderType> {
    return this.http.patch<OrderType>(`${this.apiUrl}/${id}`, orderType);
  }

  deleteOrderType(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


}
