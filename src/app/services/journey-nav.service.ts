import { Injectable } from '@angular/core';
import { ScrollService } from './scroll.service';

/**
 * JourneyNavService
 * -----------------
 * ה-Journey הוא סקשן ארוך (sticky) שבתוכו "מערכות" (acts) מוצגות
 * כל אחת בפרוגרס גלילה מסוים (0..1) מתוך הגובה הכולל שלו.
 * שירות זה מאפשר לתפריט העליון לגלול בדיוק למערכה הרצויה,
 * גם כשהיא לא DOM element נפרד עם מיקום קבוע (הכל sticky/absolute).
 */
@Injectable({ providedIn: 'root' })
export class JourneyNavService {
  private wrapperEl?: HTMLElement;
  private actProgress: Record<string, number> = {};

  constructor(private scroll: ScrollService) {}

  register(wrapperEl: HTMLElement, actProgress: Record<string, number>): void {
    this.wrapperEl = wrapperEl;
    this.actProgress = actProgress;
  }

  /** true אם המערכה קיימת בתוך ה-Journey (ולכן צריך טיפול מיוחד) */
  hasAct(name: string): boolean {
    return !!this.wrapperEl && name in this.actProgress;
  }

  scrollToAct(name: string): void {
    if (!this.wrapperEl) return;
    const progress = this.actProgress[name] ?? 0;

    const rectTop = this.wrapperEl.getBoundingClientRect().top + window.scrollY;
    const scrollableHeight = this.wrapperEl.offsetHeight - window.innerHeight;
    const targetY = rectTop + progress * Math.max(scrollableHeight, 0);

    this.scroll.scrollToY(targetY);
  }
}
