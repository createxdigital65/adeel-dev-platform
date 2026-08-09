import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ProjectItem {
  title: string;
  category: string;
  description: string;
  techs: string[];
  features: string[];
  challenges: string;
  lessons: string;
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly projects: ProjectItem[] = [
    {
      title: 'SocialMediaAgent',
      category: 'AI & Automation',
      description: 'An AI-powered social media automation platform designed for multi-channel publishing. Built with a scalable .NET backend, background worker queues, and an Angular management client.',
      techs: ['.NET 10', 'Angular 20', 'OpenAI API', 'Entity Framework', 'PostgreSQL', 'Docker'],
      features: [
        'Automated semantic draft creation via customized OpenAI prompting.',
        'Structured queues for scheduling, rate-limiting, and error-handling posts.',
        'High-fidelity dashboards displaying conversion indicators and queue health.'
      ],
      challenges: 'Managing OpenAI rate limitations and handling transient API failures from third-party social platforms during bulk publishing bursts.',
      lessons: 'Implementing a retry queue using Polly in the .NET backend and maintaining an idempotent status ledger resolved data duplication issues completely.'
    },
    {
      title: 'CoreERP Integration Engine',
      category: 'Enterprise Applications',
      description: 'High-throughput enterprise pipeline synchronization API syncing inventory, processing invoices, and dispatching logistics data to Oracle ERP.',
      techs: ['.NET 10', 'ASP.NET Core', 'SQL Server', 'Clean Architecture', 'Mediator', 'RabbitMQ'],
      features: [
        'Transactional message processing via outbox design patterns.',
        'Sub-second synchronization overhead over distributed warehouse systems.',
        'Comprehensive audit log tracing for regulatory compliance verification.'
      ],
      challenges: 'Handling extreme database connection contention under concurrent sync spikes from multiple warehouses.',
      lessons: 'Refactored SQL locking escalation policies, utilized read-committed snapshot isolation, and established background connection pools.'
    },
    {
      title: 'GrowthHub Performance CRM',
      category: 'Web Platforms & Marketing',
      description: 'Conversion-optimized CRM web portal integrating client tracking, automated email workflows, and Meta Ads attribution metrics.',
      techs: ['Angular 20', 'Signals', 'TypeScript', 'Tailwind CSS', 'Meta Ads Graph API'],
      features: [
        'Direct connection to Meta Graph endpoints to draw performance aggregates.',
        'Intelligent lead assignment flows routing high-tier prospects instantly.',
        'Responsive standalone views running zoneless state detection configurations.'
      ],
      challenges: 'Aggregating granular ads conversion stats into real-time visual client reports without causing browser layout lag.',
      lessons: 'Delegated calculation algorithms to Angular Web Workers and utilized custom CSS canvas renderings to avoid repainting cycles.'
    }
  ];

  getProjects(): Observable<ProjectItem[]> {
    return of(this.projects);
  }
}
