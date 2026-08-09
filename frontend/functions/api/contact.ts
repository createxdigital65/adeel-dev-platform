interface Env {
  CONTACT_WEBHOOK_URL?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const payload: any = await context.request.json();
    
    // Check parameters
    if (!payload.name || !payload.email || !payload.details) {
      return new Response(JSON.stringify({ error: "Missing required contact details parameters" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }

    const webhookUrl = context.env.CONTACT_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn("CONTACT_WEBHOOK_URL is not configured in environment secrets. Simulating relay.");
      return new Response(JSON.stringify({ success: true, status: "simulated" }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }

    // Proxy contact parameters securely to Discord/Slack webhook or customized REST endpoint
    const relayResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: "Adeel Dev Platform Leads",
        content: `📬 **New Portfolio Lead Sync!**\n\n**Name:** ${payload.name}\n**Email:** ${payload.email}\n**Company:** ${payload.company || "Not Specified"}\n\n**Requirements:**\n${payload.details}`
      })
    });

    if (!relayResponse.ok) {
      return new Response(JSON.stringify({ error: "Failed to forward contact request" }), {
        status: 502,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Serverless Relay Exception", message: err.message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  }
};

// Handle OPTIONS preflight requests for CORS
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
};
