import {
  Component,
  signal,
  ElementRef,
  ViewChild,
  inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArchitectureVisualizerComponent } from '../../shared/components/architecture-visualizer/architecture-visualizer';
import { AiPlaygroundDemoComponent } from '../../shared/components/ai-playground-demo/ai-playground-demo';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { CountUpDirective } from '../../shared/directives/count-up.directive';
import { ProjectService, ProjectItem } from '../../core/services/project.service';
import { ContactService } from '../../core/services/contact.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ArchitectureVisualizerComponent,
    AiPlaygroundDemoComponent,
    RevealDirective,
    CountUpDirective,
  ],
  templateUrl: './home.html',
  styleUrls: [],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('contactSection') contactSection!: ElementRef;
  @ViewChild('heroScene') heroScene?: ElementRef<HTMLElement>;

  private readonly projectService = inject(ProjectService);
  private readonly contactService = inject(ContactService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly ngZone = inject(NgZone);

  /** Teardown for the hero pointer-parallax listeners (unset on touch / reduced motion). */
  private heroParallaxCleanup?: () => void;

  // Contact Form Model
  contactName = signal('');
  contactEmail = signal('');
  contactFocus = signal('');
  contactTimeline = signal('As soon as possible');
  contactDetails = signal('');
  isSubmitting = signal(false);
  submitSuccess = signal<boolean | null>(null);

  // Fallback / Initial projects data
  projects = signal<ProjectItem[]>([
    {
      title: 'Multi-Sig Cryptocurrency Custody Engine',
      category: 'Digital Assets & Cryptography',
      description:
        'A secure crypto custody platform designed to eliminate single-point-of-failure risks in digital asset holding through distributed threshold signing.',
      techs: ['ASP.NET Core', 'C#', 'Angular', 'TypeScript', 'Cryptographic KMS', 'Multi-Sig', 'WebSockets', 'SQL Server'],
      features: [
        'Distributed threshold approval pipeline requiring multiple authorized signers before any transaction touches the blockchain.',
        'Cryptographic isolation between signing keys and public web layers, removing single-operator vulnerability vectors.',
        'Sub-second multi-asset balance reconciliation over WebSockets, catching any ledger mismatch immediately.',
      ],
      challenges:
        'If a private key leaks or an internal actor goes rogue, funds are lost forever. Standard hot wallets simply do not offer the multi-party signing checks institutional clients require.',
      lessons:
        'Built a distributed multi-signature approval pipeline that isolates authorization keys from the operational application layer, backed by HSM key storage and real-time WebSocket reconciliation.',
    },
    {
      title: 'Real-Time AML & KYC Monitoring Platform',
      category: 'FinTech & Compliance',
      description:
        'An automated compliance platform that flags suspicious transactions, monitors cashflows, and automates customer verification in real time.',
      techs: ['ASP.NET Web API', 'Clean Architecture', 'Angular', 'TypeScript', 'Entity Framework Core', 'Identity Verification APIs', 'Sanction Watchlists'],
      features: [
        'Automated Customer Due Diligence (CDD) and Enhanced Due Diligence (EDD) pipelines, cutting onboarding wait times by 80%.',
        'Real-time cashflow heuristic checks that instantly flag structuring and anomalous transfer velocity.',
        'Tamper-evident, structured audit trails that make annual regulatory examinations fast and straightforward.',
      ],
      challenges:
        'Manual reviews do not scale when transaction volumes spike. Missed sanctions, structuring, or fraud patterns expose companies to heavy regulatory penalties and account freezes.',
      lessons:
        'Engineered an automated screening pipeline that checks international sanction watchlists and evaluates transaction velocity patterns on the fly.',
    },
    {
      title: 'CJIS-Compliant Law Enforcement Portal',
      category: 'GovTech & High Security',
      description:
        'A secure data portal allowing law enforcement personnel to search sensitive criminal records across state and federal databases (NCIC/NLETS).',
      techs: ['ASP.NET Core', 'Angular', 'TypeScript', 'RBAC', 'Cryptographic Audit Logging', 'WCAG 2.1 AA', 'JWT'],
      features: [
        'Granular role-based access control (RBAC) ensuring officers only see records authorized for their jurisdiction.',
        'Immutable query logging that makes credential escalation and data leakage virtually impossible.',
        'Full WCAG 2.1 AA compliant UI, allowing rapid cross-agency deployment without accessibility friction.',
      ],
      challenges:
        'Federal CJIS standards leave zero room for error: every query must be cryptographically audited, session tokens must be strictly isolated, and interfaces must pass federal accessibility rules.',
      lessons:
        'Implemented zero-trust role-based access control, cryptographic session handling, and accessible WCAG 2.1 AA UI components that field officers can use reliably on any device.',
    },
    {
      title: 'AI-Powered Publishing & Workflow Agent',
      category: 'Enterprise AI & Automation',
      description:
        'A content workflow that drafts, formats, and schedules posts across channels using .NET background services and structured model tools.',
      techs: ['.NET 10', 'ASP.NET Core', 'LLM Integration', 'Function Calling', 'Angular', 'Job Queues', 'Social Graph APIs'],
      features: [
        'Drafts are adapted to each platform and held for a person to review and approve.',
        'Resilient .NET worker service with Polly retry policies and exponential backoff to handle rate limits cleanly.',
        'Cut manual publishing overhead by over 70% while keeping humans firmly in the loop for final sign-off.',
      ],
      challenges:
        'Marketing and ops teams spend hours reformatting copy across platforms, but naive AI scripts frequently hallucinate or fail when hitting third-party rate limits.',
      lessons:
        'Connected structured model tools to .NET worker queues, with retry policies that handle rate limits and delivery failures.',
    },
  ]);

  // Core Capabilities
  services = [
    {
      title: 'Enterprise .NET Architecture',
      subtitle: 'Backends your team can change with confidence',
      description:
        'I design ASP.NET Core APIs around your business rules, with careful attention to query performance, reliable messaging, and code your team can test and maintain.',
      techs: 'ASP.NET Core • C# • Clean Architecture • SQL Server',
      icon: 'code',
    },
    {
      title: 'Angular Product Engineering',
      subtitle: 'Fast, accessible interfaces',
      description:
        'I build responsive Angular applications with Signals, RxJS, and clear component boundaries. Accessibility is part of the implementation, not a final pass.',
      techs: 'Angular • TypeScript • Signals • RxJS • Tailwind',
      icon: 'globe',
    },
    {
      title: 'Applied AI & Workflow Design',
      subtitle: 'Useful automation, with clear limits',
      description:
        'I connect language models to real workflows with structured tools, validated outputs, and deliberate data boundaries—so people can see what the system did and decide what happens next.',
      techs: '.NET Core • Semantic Kernel • LLM Tool Calling • Guardrails',
      icon: 'cpu',
    },
    {
      title: 'Security & Regulated Systems',
      subtitle: 'Careful engineering for sensitive work',
      description:
        'I help teams work through requirements such as CJIS and AML/KYC with thoughtful access controls, cryptographic key management, multi-party approval, and useful audit trails.',
      techs: 'CJIS Standards • Multi-Sig • Cryptographic KMS • AML/KYC',
      icon: 'legacy',
    },
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
      },
    });
  }

  ngAfterViewInit(): void {
    this.setupHeroParallax();
  }

  ngOnDestroy(): void {
    this.heroParallaxCleanup?.();
  }

  /**
   * Hero depth engine — pointer parallax (desktop pointers) + scroll parallax
   * (all devices). Writes --px / --py (-0.5 .. 0.5) and --sy (0 .. 1 scroll
   * progress) on the hero element; CSS layers multiply them at different
   * magnitudes. Runs outside the Angular zone, throttled via a single
   * requestAnimationFrame, and fully disabled for reduced-motion users.
   */
  private setupHeroParallax(): void {
    const hero = this.heroScene?.nativeElement;
    if (!hero || typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    // Touch devices skip pointer tracking but keep the gentle scroll parallax.
    const allowPointer = !window.matchMedia('(hover: none), (pointer: coarse)').matches;

    this.ngZone.runOutsideAngular(() => {
      let frame = 0;
      let targetX = 0;
      let targetY = 0;
      let targetScroll = 0;

      const apply = (): void => {
        frame = 0;
        hero.style.setProperty('--px', targetX.toFixed(4));
        hero.style.setProperty('--py', targetY.toFixed(4));
        hero.style.setProperty('--sy', targetScroll.toFixed(4));
      };

      const schedule = (): void => {
        if (!frame) frame = requestAnimationFrame(apply);
      };

      const onPointerMove = (event: PointerEvent): void => {
        if (event.pointerType === 'touch') return;
        const rect = hero.getBoundingClientRect();
        targetX = Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5));
        targetY = Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5));
        schedule();
      };

      const onScroll = (): void => {
        const rect = hero.getBoundingClientRect();
        targetScroll = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
        schedule();
      };

      const resetPointer = (): void => {
        targetX = 0;
        targetY = 0;
        schedule();
      };

      const onPreferenceChange = (): void => {
        if (reducedMotion.matches) {
          targetX = 0;
          targetY = 0;
          targetScroll = 0;
          apply();
        }
      };

      if (allowPointer) {
        hero.addEventListener('pointermove', onPointerMove, { passive: true });
        hero.addEventListener('mouseleave', resetPointer);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      reducedMotion.addEventListener('change', onPreferenceChange);
      onScroll(); // Sync initial state (deep-links / restored scroll positions).

      this.heroParallaxCleanup = () => {
        hero.removeEventListener('pointermove', onPointerMove);
        hero.removeEventListener('mouseleave', resetPointer);
        window.removeEventListener('scroll', onScroll);
        reducedMotion.removeEventListener('change', onPreferenceChange);
      };
    });
  }

  toggleProject(p: ProjectItem) {
    p.expanded = !p.expanded;
  }

  scrollToContact() {
    this.contactSection?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }

  trackCtaClick(ctaName: string, location: string): void {
    this.analyticsService.trackCtaClick(ctaName, location);
  }

  trackOutreach(
    method: Parameters<AnalyticsService['trackConsultationRequest']>[0],
    location: string,
  ): void {
    this.analyticsService.trackCtaClick(`Contact via ${method}`, location);
    this.analyticsService.trackConsultationRequest(method, { location });
  }

  submitContactForm(event: Event) {
    event.preventDefault();
    if (this.isSubmitting() || !this.contactName() || !this.contactEmail()) return;

    // Basic client-side validation
    const name = this.contactName().trim();
    const email = this.contactEmail().trim();
    const details = this.contactDetails().trim();

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

    this.trackOutreach('form', 'contact-form');
    this.isSubmitting.set(true);
    this.submitSuccess.set(null);

    // Build Gmail compose URL
    const recipient = 'adeelsattar.dev@gmail.com';
    const subject = encodeURIComponent('New Project Inquiry');
    const bodyLines = [
      `Hello Adeel,`,
      ``,
      `I would like to discuss a project.`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      `Project focus: ${this.contactFocus() || 'Not specified'}`,
      `Timeline: ${this.contactTimeline()}`,
      ``,
      `Project Details:`,
      details,
      ``,
      `Sent from: adeelsattar.dev`,
    ];

    const body = encodeURIComponent(bodyLines.join('\n'));

    // Gmail compose URL (web) with parameters
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;

    // Open Gmail compose in a new tab/window
    try {
      const composeWindow = window.open(gmailUrl, '_blank');
      if (!composeWindow) {
        this.submitSuccess.set(false);
        return;
      }

      // Indicate draft ready state and reset form
      this.submitSuccess.set(true);
      this.contactName.set('');
      this.contactEmail.set('');
      this.contactFocus.set('');
      this.contactTimeline.set('As soon as possible');
      this.contactDetails.set('');
    } catch (err) {
      console.error('Could not open Gmail compose URL', err);
      this.submitSuccess.set(false);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
