import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type ChatApiResponse = {
  reply: string;
  actions?: string[];
  session_id?: string; // ✅ תואם ל-FastAPI
};

@Injectable({ providedIn: 'root' })
export class AiAgentService {
  // טיפ: בפרודקשן עדיף לשים את זה ב-environment
  // private readonly url = environment.aiUrl + '/chat';
  private readonly url = 'http://127.0.0.1:8080/chat';

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
        tap((res) => {
          // ✅ אם השרת החזיר session_id – נשמור אותו
          if (res?.session_id && res.session_id !== this.sessionId) {
            this.sessionId = res.session_id;
            localStorage.setItem('roi_ai_session', this.sessionId);
          }
        })
      );
  }

  private createSessionId(): string {
    // ✅ fallback אם randomUUID לא קיים
    const c: Crypto | undefined = (globalThis as any).crypto;
    if (c?.randomUUID) return c.randomUUID();

    // UUID פשוט (מספיק לשימוש כאן)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
      const r = (Math.random() * 16) | 0;
      const v = ch === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
