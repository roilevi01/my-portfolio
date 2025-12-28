import { Component, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header implements OnInit, OnDestroy {
  menuOpen = false;
  isScrolled = false;
  private scroll = inject(ScrollService);

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollY = window.scrollY || window.pageYOffset;
    this.isScrolled = scrollY > 50;
  }

  ngOnInit(): void {
    // Initial check
    this.onWindowScroll();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  scrollTo(sectionId: string, event: Event): void {
    event.preventDefault();
    this.scroll.scrollToElementSlowly(sectionId);
    this.menuOpen = false;
  }
}
