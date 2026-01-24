import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

type ProjectItem = {
  title: string;
  description: string;
  tech: string;
  href: string;
  label: string;
  icon: string;
};

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './projects.html',
  styleUrls: ['./projects.scss'],
})
export class Projects {
  projects: ProjectItem[] = [
    {
      title: 'Stock Alert Bot',
      description:
        'Real-time micro-cap scanner that detects sharp moves and delivers instant Telegram alerts with relevant news.',
      tech: 'Python, Finnhub API, WebSockets, Telegram Bot API',
      href: 'https://t.me/MoneyBotRoi_bot',
      label: 'View Live Bot',
      icon: '⚡',
    },
    {
      title: 'Freelance4U Platform',
      description:
        'Full-stack platform connecting freelancers and clients with authentication, RBAC, and business card management.',
      tech: 'React, .NET 8, MongoDB, JWT, Google OAuth',
      href: 'https://github.com/roilevi01/FreeLance4U',
      label: 'View on GitHub',
      icon: '🧩',
    },
    {
      title: 'Website Redesign (WordPress)',
      description:
        'UI/UX-focused redesign improving layout, responsiveness, visual hierarchy, and user flow.',
      tech: 'WordPress, CSS, UX/UI',
      href: 'https://www.linkedin.com/posts/roi-levi01_webdesign-websiteredesign-uxui-ugcPost-7392499283603853312-QPtS',
      label: 'View Case Study',
      icon: '🎨',
    },
    {
      title: 'Interactive Games Suite',
      description:
        'Collection of interactive projects focused on clean logic, animations, and responsive experiences.',
      tech: 'C#, WPF, JavaScript, CSS Animations',
      href: 'https://github.com/roilevi01',
      label: 'Explore Projects',
      icon: '🕹️',
    },
  ];

  trackByTitle(_: number, p: ProjectItem) {
    return p.title;
  }
}
