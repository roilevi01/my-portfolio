import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  scrollToElementSlowly(id: string): void {
    const target = document.getElementById(id);
    if (!target) return;

    const headerH = this.getHeaderOffset();
    const targetY =
      target.getBoundingClientRect().top + window.scrollY - headerH;

    const startY = window.scrollY;
    const distance = targetY - startY;

    const duration = 1400; // איטי ונעים
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = this.easeInOutQuint(t);

      window.scrollTo(0, startY + distance * eased);

      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  private getHeaderOffset(): number {
    const header = document.querySelector(
      'header.site-header'
    ) as HTMLElement | null;
    if (!header) return 0;
    return Math.round(header.getBoundingClientRect().height) + 10; // עוד קצת מרווח
  }

  private easeInOutQuint(t: number): number {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
  }
}
