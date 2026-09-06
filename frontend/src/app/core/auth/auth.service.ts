import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config';
import type { AuthUser, LoginResponse } from '../models/auth.model';

const STORAGE_KEY = 'jugadores.session';

interface StoredSession {
  accessToken: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<AuthUser | null>(null);
  private token: string | null = null;

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');

  constructor(private readonly http: HttpClient) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const session: StoredSession = JSON.parse(raw);
      this.token = session.accessToken;
      this.userSignal.set(session.user);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, { email, password }),
    );
    this.token = response.accessToken;
    this.userSignal.set(response.user);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accessToken: response.accessToken, user: response.user }),
    );
  }

  logout(): void {
    this.token = null;
    this.userSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }
}
