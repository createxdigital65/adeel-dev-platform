import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactPayload {
  name: string;
  email: string;
  company: string;
  details: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/contact';

  // For static deployments, do not attempt to call a backend by default.
  // Keep this method for backwards compatibility but mark it as unused in the static flow.
  submitRequest(payload: ContactPayload): Observable<any> {
    // Intentionally returns an observable error if used on a static site.
    return this.http.post<any>(this.apiUrl, payload);
  }
}
