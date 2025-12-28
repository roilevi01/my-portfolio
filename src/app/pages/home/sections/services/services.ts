import { Component, AfterViewInit, inject } from '@angular/core';
import { IntersectionObserverService } from '../../../../services/intersection-observer.service';

@Component({
  selector: 'app-services',
  standalone: true,
  templateUrl: './services.html',
  styleUrls: ['./services.scss'],
})
export class Services implements AfterViewInit {
  private intersectionObserver = inject(IntersectionObserverService);

  ngAfterViewInit(): void {
    const cards = document.querySelectorAll('.service-card');
    if (cards.length > 0) {
      this.intersectionObserver.observeMultipleElements(
        cards,
        (entry: IntersectionObserverEntry) => {
          entry.target.classList.add('visible');
        }
      );
    }
  }
}
