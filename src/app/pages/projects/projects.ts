import { Component, AfterViewInit, inject, ElementRef, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { IntersectionObserverService } from '../../services/intersection-observer.service';

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects implements AfterViewInit {
  private intersectionObserver = inject(IntersectionObserverService);

  @ViewChildren('projectCard') projectCards?: QueryList<ElementRef<HTMLElement>>;

  ngAfterViewInit(): void {
    if (this.projectCards && this.projectCards.length > 0) {
      const cards = this.projectCards.map(card => card.nativeElement);
      this.intersectionObserver.observeMultipleElements(
        cards,
        (entry: IntersectionObserverEntry) => {
          entry.target.classList.add('visible');
        }
      );
    }
  }
}
