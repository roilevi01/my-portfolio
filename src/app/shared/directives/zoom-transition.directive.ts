import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
} from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * appZoomTransition
 * ------------------
 * מדמה "מעבר בין חדרים" בגלילה: כשמגיעים לסוף הסקשן הנוכחי,
 * הוא ננעל (pin) למסך, מתחיל להתקרב (scale up) ולדעוך,
 * בעוד הסקשן הבא "צף" מעבר לו — מתקרב מ-0.86 ל-1 ומופיע מ-0 ל-1.
 * גלילה חזרה למעלה הופכת את כל התהליך בצורה חלקה (scrub).
 *
 * מושבת אוטומטית ב-mobile (< 900px) וב-prefers-reduced-motion,
 * כדי לא לפגוע בביצועים/נגישות.
 */
@Directive({
  selector: '[appZoomTransition]',
  standalone: true,
})
export class ZoomTransitionDirective implements AfterViewInit, OnDestroy {
  /** כמה "להתקרב" לפני הדעיכה (0.4 = מתקרב עד 140% מהגודל) */
  @Input() zoomIntensity = 0.4;

  /** כמה מרחק גלילה (יחסית לגובה המסך) מוקדש למעבר עצמו */
  @Input() portalLength = 0.9;

  private mm?: gsap.MatchMedia;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    const current = this.el.nativeElement;
    const next = current.nextElementSibling as HTMLElement | null;
    if (!next) return; // הסקשן האחרון — אין למה "לעבור"

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.mm = gsap.matchMedia();

    this.mm.add('(min-width: 900px)', () => {
      const st = ScrollTrigger.create({
        trigger: current,
        start: 'bottom bottom',
        end: () => '+=' + Math.round(window.innerHeight * this.portalLength),
        pin: current,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: () => this.setActive(current, next, true),
        onEnterBack: () => this.setActive(current, next, true),
        onLeave: () => this.setActive(current, next, false),
        onLeaveBack: () => this.setActive(current, next, false),
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(current, {
            scale: 1 + p * this.zoomIntensity,
            opacity: 1 - p,
            force3D: true,
          });
          gsap.set(next, {
            scale: 0.86 + p * 0.14,
            opacity: p,
            force3D: true,
          });
        },
      });

      // cleanup כשה-matchMedia context מתבטל (למשל מעבר ל-mobile)
      return () => {
        st.kill();
        gsap.set([current, next], { clearProps: 'all' });
        current.classList.remove('zoom-portal-pinning');
        next.classList.remove('zoom-portal-active');
      };
    });
  }

  private setActive(current: HTMLElement, next: HTMLElement, active: boolean) {
    next.classList.toggle('zoom-portal-active', active);
    current.classList.toggle('zoom-portal-pinning', active);
    if (!active) {
      gsap.set(current, { clearProps: 'transform,opacity' });
      gsap.set(next, { clearProps: 'transform,opacity' });
    }
  }

  ngOnDestroy(): void {
    this.mm?.revert();
  }
}
