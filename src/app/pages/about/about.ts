import { Component, inject } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-about',
  standalone: true,
  styleUrls: ['./about.scss'],
  templateUrl: './about.html',
})
export class About {
  private scroll = inject(ScrollService);

  scrollToContactSlowly(event: Event) {
    event.preventDefault();
    this.scroll.scrollToElementSlowly('contact');
  }
}
