import { Component, HostListener, signal } from '@angular/core';

/**
 * pfp-scroll-progress-bar
 * ------------------------
 * פס דק וקבוע בראש המסך שמראה אחוז התקדמות הגלילה הכולל בעמוד.
 */
@Component({
  selector: 'app-scroll-progress-bar',
  standalone: true,
  template: `<div class="scroll-progress-bar" [style.width.%]="progress()"></div>`,
  styles: [
    `
      .scroll-progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #3b82f6, #67e8f9);
        z-index: 2000;
        transition: width 80ms linear;
        pointer-events: none;
      }
    `,
  ],
})
export class ScrollProgressBar {
  progress = signal(0);

  @HostListener('window:scroll')
  onScroll(): void {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    this.progress.set(Math.min(100, Math.max(0, pct)));
  }
}
