import { Component, inject } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './about.html',
  styleUrls: ['./about.scss'],
})
export class About {
  private scroll = inject(ScrollService);

  scrollToContactSlowly(event: Event): void {
    event.preventDefault();
    this.scroll.scrollToElementSlowly('contact');
  }
}
