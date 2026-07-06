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
  private readonly apiUrl = 'http://localhost:5000/api/contact';

  submitRequest(payload: ContactPayload): Observable<string> {
    return this.http.post<string>(this.apiUrl, payload);
  }
}
