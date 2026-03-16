import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';
 
export type ChatApiResponse = {
  reply: string;
  actions?: string[];
  session_id?: string;
};
 
@Injectable({ providedIn: 'root' })
export class AiAgentService {
  private readonly url = 'https://roi-ai-agent.fly.dev/chat';
 
  private sessionId: string;
 
  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('roi_ai_session');
    this.sessionId = stored ?? this.createSessionId();
    localStorage.setItem('roi_ai_session', this.sessionId);
  }
 
  send(message: string): Observable<ChatApiResponse> {
    return this.http
      .post<ChatApiResponse>(this.url, {
        message,
        session_id: this.sessionId,
      })
      .pipe(
        timeout(30000), // 30 שניות timeout
        retry(1),       // נסה שוב פעם אחת אם נפל
        tap((res) => {
          if (res?.session_id && res.session_id !== this.sessionId) {
            this.sessionId = res.session_id;
            localStorage.setItem('roi_ai_session', this.sessionId);
          }
        })
      );
  }
 
  private createSessionId(): string {
    const c: Crypto | undefined = (globalThis as any).crypto;
    if (c?.randomUUID) return c.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
      const r = (Math.random() * 16) | 0;
      const v = ch === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}