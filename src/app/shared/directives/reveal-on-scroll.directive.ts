import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
} from '@angular/core';

type RevealVariant =
  | 'reveal'
  | 'reveal--left'
  | 'reveal--right'
  | 'reveal--up'
  | 'reveal--scale';
type RevealClass =
  | `${RevealVariant}`
  | `${RevealVariant} ${RevealVariant}`
  | string;

@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true,
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  @Input() appRevealOnScroll: RevealClass = 'reveal';
  @Input() threshold = 0.18;
  @Input() rootMargin = '0px 0px -10% 0px';

  private io?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const element = this.el.nativeElement;

    // apply classes
    String(this.appRevealOnScroll)
      .split(' ')
      .filter(Boolean)
      .forEach((c) => element.classList.add(c));

    // reduced motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      element.classList.add('is-in');
      return;
    }

    this.io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          element.classList.add('is-in');
          this.io?.unobserve(element);
        }
      },
      { threshold: this.threshold, rootMargin: this.rootMargin }
    );

    this.io.observe(element);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }
}
