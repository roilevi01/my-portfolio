import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header implements OnInit {
  menuOpen = false;
  isScrolled = false;

  private scroll = inject(ScrollService);

  ngOnInit(): void {
    this.onWindowScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollY = window.scrollY || window.pageYOffset;
    this.isScrolled = scrollY > 50;
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.menuOpen) {
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.syncBodyScroll();
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.syncBodyScroll();
  }

  private syncBodyScroll(): void {
    document.body.style.overflow = this.menuOpen ? 'hidden' : '';
  }

  scrollTo(sectionId: string, event: Event): void {
    event.preventDefault();
    this.scroll.scrollToElementSlowly(sectionId);
    this.closeMenu();
  }
}
