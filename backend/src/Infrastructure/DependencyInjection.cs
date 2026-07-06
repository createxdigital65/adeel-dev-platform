using AdeelDevPlatform.Application.Common.Interfaces;
using AdeelDevPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AdeelDevPlatform.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("DataSource") || connectionString.Contains(".db"))
        {
            // Fallback to SQLite if connection string is for SQLite or empty
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(connectionString ?? "Data Source=AdeelDevPlatform.db"));
        }
        else
        {
            // PostgreSQL connection
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString));
        }

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<ApplicationDbContextInitializer>();

        return services;
    }
}
