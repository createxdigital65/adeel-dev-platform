using AdeelDevPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AdeelDevPlatform.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Project> Projects { get; }
    DbSet<ContactRequest> ContactRequests { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
