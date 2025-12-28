import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IntersectionObserverService {
  private observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  createObserver(
    callback: (entry: IntersectionObserverEntry) => void
  ): IntersectionObserver {
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry);
        }
      });
    }, this.observerOptions);
  }

  observeElement(
    element: Element | null,
    callback: (entry: IntersectionObserverEntry) => void
  ): IntersectionObserver | null {
    if (!element) return null;

    const observer = this.createObserver((entry) => {
      callback(entry);
      observer.unobserve(entry.target);
    });

    observer.observe(element);
    return observer;
  }

  observeMultipleElements(
    elements: NodeListOf<Element> | Element[],
    callback: (entry: IntersectionObserverEntry) => void
  ): IntersectionObserver | null {
    if (!elements || elements.length === 0) return null;

    const observer = this.createObserver((entry) => {
      callback(entry);
    });

    elements.forEach((element) => {
      observer.observe(element);
    });

    return observer;
  }
}

