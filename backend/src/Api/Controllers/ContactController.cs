using AdeelDevPlatform.Application.Contact.Commands;
using Microsoft.AspNetCore.Mvc;

namespace AdeelDevPlatform.Api.Controllers;

public class ContactController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<Guid>> Create(SubmitContactCommand command)
    {
        return await Mediator.Send(command);
    }
}
