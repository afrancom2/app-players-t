import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  async submit(): Promise<void> {
    this.errorMessage.set(null);
    this.loading.set(true);
    try {
      await this.authService.login(this.email.trim(), this.password);
      await this.router.navigateByUrl('/jugadores');
    } catch {
      this.errorMessage.set('Correo o contraseña incorrectos.');
    } finally {
      this.loading.set(false);
    }
  }
}
