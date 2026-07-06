using AdeelDevPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AdeelDevPlatform.Application.Projects.Queries;

public record ProjectDto(
    Guid Id,
    string Title,
    string Category,
    string Description,
    List<string> Techs,
    List<string> Features,
    string Challenges,
    string Lessons
);

public record GetProjectsQuery : IRequest<List<ProjectDto>>;

public class GetProjectsQueryHandler : IRequestHandler<GetProjectsQuery, List<ProjectDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProjectsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProjectDto>> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
    {
        var projects = await _context.Projects
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return projects.Select(p => new ProjectDto(
            p.Id,
            p.Title,
            p.Category,
            p.Description,
            p.TechStack.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
            p.Features.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
            p.Challenges,
            p.Lessons
        )).ToList();
    }
}
