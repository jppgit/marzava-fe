import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class NotificationInterceptor implements HttpInterceptor {

  constructor(private snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (isMutation && event instanceof HttpResponse) {
          this.snackBar.open('Operación completada con éxito', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (isMutation) {
          this.snackBar.open('Hubo un error al procesar la solicitud', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
        return throwError(() => error);
      })
    );
  }
}
