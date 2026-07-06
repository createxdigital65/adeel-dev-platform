using AdeelDevPlatform.Application.Common.Interfaces;
using AdeelDevPlatform.Domain.Entities;
using FluentValidation;
using MediatR;

namespace AdeelDevPlatform.Application.Contact.Commands;

public record SubmitContactCommand(
    string Name,
    string Email,
    string Company,
    string Details
) : IRequest<Guid>;

public class SubmitContactCommandValidator : AbstractValidator<SubmitContactCommand>
{
    public SubmitContactCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(v => v.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email must be a valid email address.");

        RuleFor(v => v.Details)
            .NotEmpty().WithMessage("Project details are required.")
            .MaximumLength(2000).WithMessage("Details must not exceed 2000 characters.");
    }
}

public class SubmitContactCommandHandler : IRequestHandler<SubmitContactCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public SubmitContactCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(SubmitContactCommand request, CancellationToken cancellationToken)
    {
        var entity = new ContactRequest
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            Company = request.Company,
            Details = request.Details,
            CreatedAt = DateTime.UtcNow
        };

        _context.ContactRequests.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
