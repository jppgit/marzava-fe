import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('marzava-fe');
  private healthcheckSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // 60000 ms = 1 minute
    this.healthcheckSubscription = interval(60000).subscribe(() => {
      if (this.authService.isLoggedIn()) {
        this.authService.healthcheck().subscribe({
          next: () => console.log('Healthcheck OK'),
          error: (err) => console.error('Healthcheck failed', err)
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.healthcheckSubscription) {
      this.healthcheckSubscription.unsubscribe();
    }
  }
}
