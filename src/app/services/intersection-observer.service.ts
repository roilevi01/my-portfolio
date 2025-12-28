import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IntersectionObserverService {
  private observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px',
  };

  createObserver(
    callback: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const finalOptions = { ...this.observerOptions, ...options };
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Use requestAnimationFrame for smoother animations
          requestAnimationFrame(() => {
            callback(entry);
          });
        }
      });
    }, finalOptions);
  }

  observeElement(
    element: Element | null,
    callback: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver | null {
    if (!element) return null;

    const observer = this.createObserver((entry) => {
      callback(entry);
      observer.unobserve(entry.target);
    }, options);

    observer.observe(element);
    return observer;
  }

  observeMultipleElements(
    elements: NodeListOf<Element> | Element[],
    callback: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver | null {
    if (!elements || elements.length === 0) return null;

    const observer = this.createObserver((entry) => {
      callback(entry);
    }, options);

    elements.forEach((element) => {
      observer.observe(element);
    });

    return observer;
  }
}

