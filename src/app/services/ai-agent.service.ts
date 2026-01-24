import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ChatApiResponse = {
  reply: string;
  actions?: string[];
};

@Injectable({ providedIn: 'root' })
export class AiAgentService {
  private readonly url = 'http://127.0.0.1:8080/chat';

  private readonly sessionId: string;

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('roi_ai_session');
    this.sessionId = stored ?? crypto.randomUUID();
    localStorage.setItem('roi_ai_session', this.sessionId);
  }

  send(message: string): Observable<ChatApiResponse> {
    return this.http.post<ChatApiResponse>(this.url, {
      message,
      session_id: this.sessionId,
    });
  }
}
