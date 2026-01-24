import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';

type ServiceItem = {
  icon: string;
  title: string;
  description: string;
  tags: string[];
};

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './services.html',
  styleUrls: ['./services.scss'],
})
export class Services {
  services: ServiceItem[] = [
    {
      icon: '⚡',
      title: 'Frontend Development',
      description:
        'Modern UI with Angular/React, clean components, responsive layouts, and premium UX details.',
      tags: ['Angular', 'React', 'UI/UX', 'Responsive'],
    },
    {
      icon: '🧠',
      title: 'Backend Development',
      description:
        'Secure APIs, authentication, role-based access, and scalable logic with clean architecture.',
      tags: ['.NET', 'Node.js', 'REST', 'JWT'],
    },
    {
      icon: '🗄️',
      title: 'Database & Data',
      description:
        'Design and integration with SQL/MongoDB, data modeling, and performance-minded querying.',
      tags: ['MongoDB', 'SQL Server', 'Design', 'Performance'],
    },
    {
      icon: '🚀',
      title: 'Deployment & Reliability',
      description:
        'Production-ready setup, env handling, clean builds, and stable project structure.',
      tags: ['GitHub', 'CI/CD', 'Deploy', 'Best Practices'],
    },
  ];
}
