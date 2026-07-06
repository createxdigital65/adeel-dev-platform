using AdeelDevPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AdeelDevPlatform.Infrastructure.Persistence;

public class ApplicationDbContextInitializer
{
    private readonly ILogger<ApplicationDbContextInitializer> _logger;
    private readonly ApplicationDbContext _context;

    public ApplicationDbContextInitializer(ILogger<ApplicationDbContextInitializer> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    public async Task InitializeAsync()
    {
        try
        {
            if (_context.Database.IsSqlite() || _context.Database.IsNpgsql())
            {
                await _context.Database.EnsureCreatedAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initializing the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    private async Task TrySeedAsync()
    {
        // Only seed if projects don't exist
        if (!await _context.Projects.AnyAsync())
        {
            _logger.LogInformation("Seeding default projects database...");

            _context.Projects.AddRange(
                new Project
                {
                    Id = Guid.NewGuid(),
                    Title = "SocialMediaAgent",
                    Category = "AI & Automation",
                    Description = "AI-powered social media automation platform designed for multi-channel publishing. Built with a scalable .NET backend, background worker queues, and an Angular management client.",
                    TechStack = ".NET 10, Angular 20, OpenAI API, Entity Framework, PostgreSQL, Docker",
                    Features = "Automated semantic draft creation via OpenAI.\nStructured queues for scheduling and error handling.\nHigh-fidelity dashboards displaying conversion statistics.",
                    Challenges = "Managing OpenAI rate limitations and handling transient API failures from third-party social platforms during bulk publishing bursts.",
                    Lessons = "Implementing a retry queue using Polly in the .NET backend and maintaining an idempotent status ledger resolved data duplication issues."
                },
                new Project
                {
                    Id = Guid.NewGuid(),
                    Title = "CoreERP Integration Engine",
                    Category = "Enterprise Applications",
                    Description = "High-throughput enterprise pipeline synchronization API syncing inventory, processing invoices, and dispatching logistics data to Oracle ERP.",
                    TechStack = ".NET 10, ASP.NET Core, SQL Server, Clean Architecture, Mediator, RabbitMQ",
                    Features = "Transactional message processing via outbox design patterns.\nSub-second synchronization overhead over distributed warehouse systems.\nComprehensive audit log tracing for regulatory compliance verification.",
                    Challenges = "Handling extreme database connection contention under concurrent sync spikes from multiple warehouses.",
                    Lessons = "Refactored SQL locking escalation policies, utilized read-committed snapshot isolation, and established background connection pools."
                },
                new Project
                {
                    Id = Guid.NewGuid(),
                    Title = "GrowthHub Performance CRM",
                    Category = "Web Platforms & Marketing",
                    Description = "Conversion-optimized CRM web portal integrating client tracking, automated email workflows, and Meta Ads attribution metrics.",
                    TechStack = "Angular 20, Signals, TypeScript, Tailwind CSS, Meta Ads Graph API",
                    Features = "Direct connection to Meta Graph endpoints to draw performance aggregates.\nIntelligent lead assignment flows routing high-tier prospects instantly.\nResponsive standalone views running zoneless state detection configurations.",
                    Challenges = "Aggregating granular ads conversion stats into real-time visual client reports without causing browser layout lag.",
                    Lessons = "Delegated calculation algorithms to Angular Web Workers and utilized custom CSS canvas renderings to avoid repainting cycles."
                }
            );

            await _context.SaveChangesAsync();
        }
    }
}
