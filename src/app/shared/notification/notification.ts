import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationData } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  data: NotificationData | null = null;
  private subscription: Subscription = new Subscription();
  private timeoutId: any;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.subscription = this.notificationService.notification$.subscribe((notification) => {
      this.data = notification;

      if (notification) {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => this.close(), 4000);
      }
    });
  }

  close() {
    this.data = null;
    this.notificationService.clear();
  }
  ngOnDestroy() {
    // Limpieza de memoria al destruir el componente
    this.subscription.unsubscribe();
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}