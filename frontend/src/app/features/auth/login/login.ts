import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import type { ClassifiedError } from '../../../core/http/classified-error';

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
    } catch (err) {
      this.errorMessage.set(this.describeLoginError(err));
    } finally {
      this.loading.set(false);
    }
  }

  private describeLoginError(err: unknown): string {
    const classified = err as Partial<ClassifiedError>;
    if (typeof classified?.message === 'string') {
      // 401 del backend ya trae "Credenciales inválidas"; cualquier otro
      // origen (conexión, servidor, base de datos) muestra su propio mensaje.
      return classified.message;
    }
    return 'No se pudo iniciar sesión. Intenta nuevamente.';
  }
}
