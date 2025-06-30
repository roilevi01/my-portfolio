import { Component, inject } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  menuOpen = false;
  private scroll = inject(ScrollService);

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  scrollTo(sectionId: string, event: Event): void {
    event.preventDefault();
    this.scroll.scrollToElementSlowly(sectionId);
    this.menuOpen = false;
  }
}
