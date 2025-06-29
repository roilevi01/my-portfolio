import { Component, inject } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  private scroll = inject(ScrollService);

  scrollTo(sectionId: string, event: Event) {
    event.preventDefault();
    this.scroll.scrollToElementSlowly(sectionId);
  }
}
