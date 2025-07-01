import { Component, inject, AfterViewInit } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-about',
  standalone: true,
  styleUrls: ['./about.scss'],
  templateUrl: './about.html',
})
export class About implements AfterViewInit {
  private scroll = inject(ScrollService);

  scrollToContactSlowly(event: Event) {
    event.preventDefault();
    this.scroll.scrollToElementSlowly('contact');
  }

  ngAfterViewInit() {
    const image = document.querySelector('.bounce-up-from-footer');
    if (!image) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            obs.unobserve(entry.target); // אנימציה רק פעם אחת
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(image);
  }
}
