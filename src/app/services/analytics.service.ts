import { Injectable } from '@angular/core';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * AnalyticsService
 * ----------------
 * עטיפה דקה סביב gtag (Google Analytics 4).
 * לא זורק שגיאה אם gtag חסום (Ad-blocker) או לא נטען עדיין.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  trackEvent(action: string, category: string, label: string): void {
    try {
      window.gtag?.('event', action, {
        event_category: category,
        event_label: label,
      });
    } catch {
      // מתעלמים בשקט — אנליטיקס לא אמור לשבור את האתר בשום מצב
    }
  }

  trackProjectClick(projectTitle: string): void {
    this.trackEvent('click', 'project', projectTitle);
  }

  trackCvDownload(cvType: 'FullStack' | 'NOC'): void {
    this.trackEvent('download', 'cv', cvType);
  }
}
