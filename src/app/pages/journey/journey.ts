import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollService } from '../../services/scroll.service';
import { JourneyNavService } from '../../services/journey-nav.service';
import { AnalyticsService } from '../../services/analytics.service';

gsap.registerPlugin(ScrollTrigger);

/**
 * app-journey
 * -----------
 * "מסע התמונה": תמונה אחת של רועי נשארת נעולה (sticky) במסך,
 * מתחלפת בין 2 תמונות ומתקרבת (זום) תוך כדי גלילה, ולצידה
 * מתחלף תוכן על פני 6 "מערכות": Intro → About → NOC → Projects →
 * Services → Contact (teaser).
 *
 * מבוסס position:sticky (טבעי, לא תלוי ב-pin של GSAP) + timeline
 * אחד מסונכרן לגלילה (scrub).
 */
@Component({
  selector: 'app-journey',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './journey.html',
  styleUrls: ['./journey.scss'],
})
export class Journey implements AfterViewInit, OnDestroy {
  @ViewChild('wrapper', { static: true }) wrapperRef!: ElementRef<HTMLElement>;
  @ViewChild('photoA', { static: true }) photoARef!: ElementRef<HTMLElement>;
  @ViewChild('photoB', { static: true }) photoBRef!: ElementRef<HTMLElement>;

  @ViewChild('panelIntro', { static: true }) panelIntroRef!: ElementRef<HTMLElement>;
  @ViewChild('panelAbout', { static: true }) panelAboutRef!: ElementRef<HTMLElement>;
  @ViewChild('panelNoc', { static: true }) panelNocRef!: ElementRef<HTMLElement>;
  @ViewChild('panelProjects', { static: true }) panelProjectsRef!: ElementRef<HTMLElement>;
  @ViewChild('panelServices', { static: true }) panelServicesRef!: ElementRef<HTMLElement>;
  @ViewChild('panelContact', { static: true }) panelContactRef!: ElementRef<HTMLElement>;

  nocSkills = [
    'Linux (Ubuntu)', 'TCP/IP', 'DNS', 'DHCP', 'Firewall', 'Nagios', 'Zabbix', 'Incident Response',
  ];

  projects = [
    { icon: '⚡', title: 'Stock Alert Bot', tech: 'Python · WebSockets · Telegram API', href: 'https://t.me/MoneyBotRoi_bot', label: 'View Live Bot' },
    { icon: '🧩', title: 'Freelance4U Platform', tech: 'React · .NET 8 · MongoDB · JWT', href: 'https://github.com/roilevi01/FreeLance4U', label: 'View on GitHub' },
    { icon: '🎨', title: 'Website Redesign', tech: 'WordPress · CSS · UX/UI', href: 'https://www.linkedin.com/posts/roi-levi01_webdesign-websiteredesign-uxui-ugcPost-7392499283603853312-QPtS', label: 'View Case Study' },
    { icon: '🕹️', title: 'Interactive Games Suite', tech: 'C# · WPF · JavaScript', href: 'https://github.com/roilevi01', label: 'Explore Projects' },
  ];

  services = [
    { icon: '⚡', title: 'Frontend', tags: 'Angular · React · UI/UX' },
    { icon: '🧠', title: 'Backend', tags: '.NET · Node.js · REST' },
    { icon: '🗄️', title: 'Database', tags: 'MongoDB · SQL Server' },
    { icon: '🚀', title: 'Deployment', tags: 'GitHub · CI/CD' },
  ];

  /** נקודות ה"שיא" (0..1) שבהן כל מערכה גלויה במלואה — לשימוש גם ע"י התפריט העליון */
  private readonly actProgress: Record<string, number> = {
    resume: 0,
    about: 0.16,
    noc: 0.36,
    projects: 0.56,
    services: 0.76,
    // 'contact' לא נכלל בכוונה: קליק על "Contact" בתפריט צריך להוביל
    // לטופס האמיתי (app-contact) מתחת ל-Journey, לא ל-teaser שבתוכו.
  };

  /** תוויות לנקודות הניווט הצדדיות */
  actLabels = ['Intro', 'About', 'NOC', 'Projects', 'Services', 'Contact'];
  activeIndex = signal(0);

  private readonly units = this.actLabels.length - 1; // 5 מעברים בין 6 מערכות
  private keyboardNavEnabled = false;

  private tl?: gsap.core.Timeline;
  private mm?: gsap.MatchMedia;

  constructor(
    private scroll: ScrollService,
    private journeyNav: JourneyNavService,
    private analytics: AnalyticsService,
  ) {}

  scrollToContactSlowly(event: Event): void {
    event.preventDefault();
    this.scroll.scrollToElementSlowly('contact');
  }

  onProjectClick(title: string): void {
    this.analytics.trackProjectClick(title);
  }

  onCvDownload(cvType: 'FullStack' | 'NOC'): void {
    this.analytics.trackCvDownload(cvType);
  }

  /** קליק על נקודת ניווט צדדית — גלילה למערכה הרצויה */
  goToAct(index: number): void {
    const wrapper = this.wrapperRef.nativeElement;
    const progress = index / this.units;
    const rectTop = wrapper.getBoundingClientRect().top + window.scrollY;
    const scrollableHeight = wrapper.offsetHeight - window.innerHeight;
    const targetY = rectTop + progress * Math.max(scrollableHeight, 0);
    this.scroll.scrollToY(targetY);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.keyboardNavEnabled) return;
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    // לא לחטוף חיצים כשמישהו מקליד בטופס
    const tag = (document.activeElement?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    // רק כשעדיין בתוך טווח הגלילה של ה-Journey
    const wrapper = this.wrapperRef.nativeElement;
    const rect = wrapper.getBoundingClientRect();
    const withinJourney = rect.top <= 0 && rect.bottom > window.innerHeight * 0.5;
    if (!withinJourney) return;

    event.preventDefault();
    const next =
      event.key === 'ArrowDown'
        ? Math.min(this.units, this.activeIndex() + 1)
        : Math.max(0, this.activeIndex() - 1);
    this.goToAct(next);
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    const wrapper = this.wrapperRef.nativeElement;
    this.journeyNav.register(wrapper, this.actProgress);

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const photoA = this.photoARef.nativeElement;
    const photoB = this.photoBRef.nativeElement;
    const panels = [
      this.panelIntroRef.nativeElement,
      this.panelAboutRef.nativeElement,
      this.panelNocRef.nativeElement,
      this.panelProjectsRef.nativeElement,
      this.panelServicesRef.nativeElement,
      this.panelContactRef.nativeElement,
    ];
    // תמונה פעילה של כל מערכה, בסבב A/B/A/B...
    const photoForAct = (i: number) => (i % 2 === 0 ? photoA : photoB);

    this.mm = gsap.matchMedia();

    this.mm.add('(min-width: 820px)', () => {
      // מצב התחלה
      // שימוש ב-autoAlpha (ולא opacity) לפאנלים: זה גם משנה שקיפות
      // וגם קובע visibility:hidden כשמגיעים ל-0, כך שפאנל שקוף
      // באמת לא "תופס" קליקים שמיועדים לפאנל הגלוי מתחתיו/מעליו.
      gsap.set(photoA, { opacity: 1, scale: 1 });
      gsap.set(photoB, { opacity: 0, scale: 1.05 });
      gsap.set(panels[0], { autoAlpha: 1, y: 0 });
      gsap.set(panels.slice(1), { autoAlpha: 0, y: 40 });

      this.keyboardNavEnabled = true;

      this.tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            this.activeIndex.set(Math.round(self.progress * this.units));
          },
        },
      });

      const units = this.units; // מספר "מעברים" בין מערכות

      for (let i = 0; i < units; i++) {
        const unitStart = i / units;
        const unitEnd = (i + 1) / units;
        const span = unitEnd - unitStart;

        const currentPanel = panels[i];
        const nextPanel = panels[i + 1];
        const currentPhoto = photoForAct(i);
        const nextPhoto = photoForAct(i + 1);

        // דעיכת המערכה הנוכחית (35% הראשונים של המעבר)
        this.tl.to(
          currentPanel,
          { autoAlpha: 0, y: -40, ease: 'power1.in', duration: span * 0.35 },
          unitStart,
        );

        // אם התמונה מתחלפת (סבב A/B) — נזום קדימה ונדעך
        if (currentPhoto !== nextPhoto) {
          this.tl
            .to(currentPhoto, { scale: 1.35, ease: 'power1.in', duration: span * 0.4 }, unitStart)
            .to(currentPhoto, { opacity: 0, ease: 'power1.in', duration: span * 0.25 }, unitStart + span * 0.4)
            .set(nextPhoto, { scale: 0.95 }, unitStart + span * 0.55)
            .to(nextPhoto, { opacity: 1, scale: 1, ease: 'power1.out', duration: span * 0.35 }, unitStart + span * 0.58);
        }

        // הופעת המערכה הבאה (62%-97% של המעבר)
        this.tl.to(
          nextPanel,
          { autoAlpha: 1, y: 0, ease: 'power1.out', duration: span * 0.35 },
          unitStart + span * 0.62,
        );
      }

      return () => {
        this.keyboardNavEnabled = false;
        this.tl?.scrollTrigger?.kill();
        this.tl?.kill();
        gsap.set([photoA, photoB, ...panels], { clearProps: 'all' });
      };
    });
  }

  ngOnDestroy(): void {
    this.keyboardNavEnabled = false;
    this.mm?.revert();
  }
}
