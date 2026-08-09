import { Component, signal, HostListener, ElementRef, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArchitectureVisualizerComponent } from '../../shared/components/architecture-visualizer/architecture-visualizer';
import { AiPlaygroundDemoComponent } from '../../shared/components/ai-playground-demo/ai-playground-demo';
import { ProjectService, ProjectItem } from '../../core/services/project.service';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ArchitectureVisualizerComponent,
    AiPlaygroundDemoComponent
  ],
  templateUrl: './home.html',
  styleUrls: []
})
export class HomeComponent implements OnInit {
  @ViewChild('contactSection') contactSection!: ElementRef;

  private readonly projectService = inject(ProjectService);
  private readonly contactService = inject(ContactService);

  // Contact Form Model
  contactName = signal('');
  contactEmail = signal('');
  contactCompany = signal('');
  contactDetails = signal('');
  isSubmitting = signal(false);
  submitSuccess = signal<boolean | null>(null);

  // Fallback / Initial projects data
  projects = signal<ProjectItem[]>([
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
  ]);

  // Skill groupings
  skillGroups = [
    {
      title: 'Software Engineering',
      skills: ['.NET 10', 'ASP.NET Core', 'Web APIs', 'Entity Framework', 'SQL Server', 'Clean Architecture', 'CQRS', 'Design Patterns']
    },
    {
      title: 'Frontend Development',
      skills: ['Angular 20', 'TypeScript', 'Tailwind CSS', 'Angular Signals', 'Zoneless Change Detection', 'HTML5 / Semantic HTML', 'Web APIs Integration']
    },
    {
      title: 'AI & Automation',
      skills: ['OpenAI Integrations', 'AI Agents Orchestration', 'Prompt Engineering', 'LangChain Concepts', 'Background Automation Workers']
    },
    {
      title: 'DevOps & Infrastructure',
      skills: ['Docker & Compose', 'Linux VPS Admin', 'GitHub Actions CI/CD', 'SSL/Caddy Configuration', 'Log Monitoring']
    },
    {
      title: 'Business & Growth',
      skills: ['WordPress Solutions', 'Meta Advertising Campaigns', 'Conversion Funnel Auditing', 'Technical Product Strategy']
    }
  ];

  // Services offerings
  services = [
    {
      title: 'Custom Software Development',
      description: 'Architecting high-performance enterprise systems using Clean Architecture, strong typing, and robust testing protocols.',
      icon: 'code'
    },
    {
      title: 'Web Applications & APIs',
      description: 'Creating high-fidelity, standalone Angular single page applications communicating with secure, versioned Web APIs.',
      icon: 'globe'
    },
    {
      title: 'Business Automation & AI',
      description: 'Automating high-friction operational workflows, integrating LLMs, qualifying marketing leads, and drafting text logs automatically.',
      icon: 'cpu'
    },
    {
      title: 'WordPress Solutions',
      description: 'Designing highly-customized WordPress architectures, configuring hosting pipelines, and improving caching parameters.',
      icon: 'wordpress'
    },
    {
      title: 'Meta Ads & Growth Systems',
      description: 'Structuring pixel triggers, setting up server-to-server Conversions API, and analyzing funnel bottlenecks for marketing returns.',
      icon: 'trending'
    }
  ];

  ngOnInit() {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.projects.set(data);
        }
      },
      error: (err) => {
        console.warn('Could not load projects from API, keeping fallback default projects.', err);
      }
    });
  }

  toggleProject(p: ProjectItem) {
    p.expanded = !p.expanded;
  }

  scrollToContact() {
    this.contactSection?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }

  submitContactForm(event: Event) {
    event.preventDefault();
    if (this.isSubmitting() || !this.contactName() || !this.contactEmail()) return;

    // Basic client-side validation
    const name = this.contactName().trim();
    const email = this.contactEmail().trim();
    const details = this.contactDetails().trim();
    const company = this.contactCompany().trim();

    if (!name) {
      this.submitSuccess.set(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.submitSuccess.set(false);
      return;
    }

    if (!details) {
      this.submitSuccess.set(false);
      return;
    }

    this.isSubmitting.set(true);
    this.submitSuccess.set(null);

    // Build Gmail compose URL
    const recipient = 'adeelsattar.dev@gmail.com';
    const subject = encodeURIComponent(`New Project Inquiry — ${company || 'General'}`);
    const bodyLines = [
      `Hello Adeel,`,
      ``,
      `I would like to discuss a project.`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || 'N/A'}`,
      ``,
      `Project Details:`,
      details,
      ``,
      `Sent from: adeelsattar.dev`
    ];

    const body = encodeURIComponent(bodyLines.join('\n'));

    // Gmail compose URL (web) with parameters
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;

    // Open Gmail compose in a new tab/window
    try {
      window.open(gmailUrl, '_blank');
      // Indicate draft ready state and reset form
      this.submitSuccess.set(true);
      this.contactName.set('');
      this.contactEmail.set('');
      this.contactCompany.set('');
      this.contactDetails.set('');
    } catch (err) {
      console.error('Could not open Gmail compose URL', err);
      this.submitSuccess.set(false);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Mouse move tracker for card glow effects (Bento Grid)
  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const cards = document.querySelectorAll('.glow-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    });
  }
}
