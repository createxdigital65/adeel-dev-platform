using AdeelDevPlatform.Application.Projects.Queries;
using Microsoft.AspNetCore.Mvc;

namespace AdeelDevPlatform.Api.Controllers;

public class ProjectsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ProjectDto>>> Get()
    {
        return await Mediator.Send(new GetProjectsQuery());
    }
}
