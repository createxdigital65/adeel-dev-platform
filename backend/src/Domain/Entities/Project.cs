namespace AdeelDevPlatform.Domain.Entities;

public class Project
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TechStack { get; set; } = string.Empty; // Comma separated values
    public string Features { get; set; } = string.Empty; // Line separated list
    public string Challenges { get; set; } = string.Empty;
    public string Lessons { get; set; } = string.Empty;
}
