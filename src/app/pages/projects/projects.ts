import { Component, AfterViewInit, inject } from '@angular/core';
import { IntersectionObserverService } from '../../services/intersection-observer.service';

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects implements AfterViewInit {
  private intersectionObserver = inject(IntersectionObserverService);

  ngAfterViewInit(): void {
    const cards = document.querySelectorAll('.project-card');
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
