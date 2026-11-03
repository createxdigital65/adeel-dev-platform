import { Component, signal, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../core/services/analytics.service';

interface TechSpec {
  title: string;
  badge: string;
  description: string;
  bullets: string[];
  codeBlock: string;
}

@Component({
  selector: 'app-architecture',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './architecture.html',
  styleUrls: []
})
export class ArchitectureComponent {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  selectedTab = signal<string>('clean-arch');

  constructor() {
    const pageTitle = 'Software Architecture & System Design | Adeel Sattar';
    const description =
      'Explore the architecture behind Adeel Sattar’s consulting platform: Angular, ASP.NET Core, cloud deployment, and maintainable system design.';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: 'https://adeelsattar.dev/architecture' });
    this.meta.updateTag({ name: 'twitter:url', content: 'https://adeelsattar.dev/architecture' });
    this.meta.updateTag({
      name: 'twitter:title',
      content: pageTitle,
    });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.document
      .querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?.setAttribute('href', 'https://adeelsattar.dev/architecture');
  }

  specs: Record<string, TechSpec> = {
    'clean-arch': {
      title: 'Clean Architecture Pattern',
      badge: 'Core Pattern',
      description: 'The backend separates business rules from application workflows, infrastructure, and HTTP endpoints. Dependencies point inward so core decisions remain testable.',
      bullets: [
        'Domain: Business entities and rules, kept independent of databases and frameworks.',
        'Application: Use cases, validation, and the interfaces that workflows depend on.',
        'Infrastructure: Database access and adapters for external services.',
        'API: HTTP endpoints, authentication, and the boundary to client applications.'
      ],
      codeBlock: `// Typical Application Request Handler Flow
public class CreateProjectCommandHandler 
    : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IDateTime _dateTime;

    public CreateProjectCommandHandler(IApplicationDbContext context, IDateTime dateTime)
    {
        _context = context;
        _dateTime = dateTime;
    }

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var entity = new Project
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Created = _dateTime.Now
        };

        _context.Projects.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}`
    },
    'frontend-arch': {
      title: 'Angular application structure',
      badge: 'Client Stack',
      description: 'The client uses standalone Angular components and signals to keep related state close to the views that use it.',
      bullets: [
        'Standalone components declare their own dependencies and can be loaded independently.',
        'Signals make local UI state explicit and update the views that depend on it.',
        'HTTP interceptors provide a shared place for request concerns such as authentication and error handling.',
        'Small component boundaries make features easier to test and change.'
      ],
      codeBlock: `// Standalone Angular component using signals
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    <button (click)="increment()">Count: {{ count() }}</button>
    <p>Double: {{ doubleCount() }}</p>
  \`
})
export class CounterComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + 1);
  }
}`
    },
    'devops-arch': {
      title: 'Container builds and deployment',
      badge: 'Infrastructure',
      description: 'A multi-stage container build keeps SDK tooling out of the runtime image and provides a repeatable path from source to deployment.',
      bullets: [
        'Multi-stage Dockerfiles separate compilation tools from the final runtime image.',
        'A reverse proxy can route client and API traffic and manage HTTPS.',
        'Using the same container setup locally and in deployment helps surface environment differences early.',
        'Build and deployment checks can automate linting, tests, and image publishing.'
      ],
      codeBlock: `# Multi-stage backend build Dockerfile snippet
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /app

# Copy and restore sln layers
COPY *.sln .
COPY backend/src/Api/*.csproj ./backend/src/Api/
RUN dotnet restore

# Copy all resources and build release
COPY . .
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build-env /app/out .
ENTRYPOINT ["dotnet", "Backend.Api.dll"]`
    }
  };

  selectTab(tabId: string) {
    this.selectedTab.set(tabId);
    this.analyticsService.trackCtaClick(`architecture_tab_${tabId}`, 'architecture-page');
  }

  trackContactClick(): void {
    this.analyticsService.trackCtaClick('Contact from architecture page', 'architecture-page');
  }

  trackRelatedClick(destination: 'case-studies' | 'services'): void {
    this.analyticsService.trackCtaClick(`Explore ${destination}`, 'architecture-page');
  }

  getCurrentSpec(): TechSpec {
    return this.specs[this.selectedTab()] || this.specs['clean-arch'];
  }
}
