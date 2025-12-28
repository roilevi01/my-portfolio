import { Component, AfterViewInit, inject, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { IntersectionObserverService } from '../../../../services/intersection-observer.service';

@Component({
  selector: 'app-services',
  standalone: true,
  templateUrl: './services.html',
  styleUrls: ['./services.scss'],
})
export class Services implements AfterViewInit {
  private intersectionObserver = inject(IntersectionObserverService);

  @ViewChildren('serviceCard') serviceCards?: QueryList<ElementRef<HTMLElement>>;

  ngAfterViewInit(): void {
    if (this.serviceCards && this.serviceCards.length > 0) {
      const cards = this.serviceCards.map(card => card.nativeElement);
      this.intersectionObserver.observeMultipleElements(
        cards,
        (entry: IntersectionObserverEntry) => {
          entry.target.classList.add('visible');
        }
      );
    }
  }
}
