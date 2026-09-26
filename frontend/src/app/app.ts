import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { ConfirmDialog } from './shared/ui/confirm-dialog/confirm-dialog';
import { ThemeToggle } from './shared/ui/theme-toggle/theme-toggle';
import { ToastContainer } from './shared/ui/toast/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, ToastContainer, ConfirmDialog, ThemeToggle],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
