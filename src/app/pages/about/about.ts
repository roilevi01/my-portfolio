import { Component, inject, AfterViewInit } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';
import { IntersectionObserverService } from '../../services/intersection-observer.service';

@Component({
  selector: 'app-about',
  standalone: true,
  styleUrls: ['./about.scss'],
  templateUrl: './about.html',
})
export class About implements AfterViewInit {
  private scroll = inject(ScrollService);
  private intersectionObserver = inject(IntersectionObserverService);

  scrollToContactSlowly(event: Event) {
    event.preventDefault();
    this.scroll.scrollToElementSlowly('contact');
  }

  ngAfterViewInit() {
    // Animate image
    const image = document.querySelector('.about img');
    if (image) {
      this.intersectionObserver.observeElement(image, (entry: IntersectionObserverEntry) => {
        entry.target.classList.add('visible');
      });
    }

    // Animate text
    const text = document.querySelector('.about .text');
    if (text) {
      this.intersectionObserver.observeElement(text, (entry: IntersectionObserverEntry) => {
        entry.target.classList.add('visible');
      });
    }
  }
}
