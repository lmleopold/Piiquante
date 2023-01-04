import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuth$ = new BehaviorSubject<boolean>(false);
  private authToken = '';
  private userId = '';

  constructor(private http: HttpClient, private router: Router) {}

  createUser(email: string, password: string) {
    const serverUrl = environment.BACKEND_URL || 'http://localhost:3000';
    return this.http.post<{ message: string }>(`${serverUrl}/api/auth/signup`, {
      email: email,
      password: password,
    });
  }

  getToken() {
    return this.authToken;
  }

  getUserId() {
    return this.userId;
  }

  loginUser(email: string, password: string) {
    const serverUrl = environment.BACKEND_URL || 'http://localhost:3000';
    return this.http
      .post<{ userId: string; token: string }>(`${serverUrl}/api/auth/login`, {
        email: email,
        password: password,
      })
      .pipe(
        tap(({ userId, token }) => {
          this.userId = userId;
          this.authToken = token;
          this.isAuth$.next(true);
        })
      );
  }

  logout() {
    this.authToken = '';
    this.userId = '';
    this.isAuth$.next(false);
    this.router.navigate(['login']);
  }
}
