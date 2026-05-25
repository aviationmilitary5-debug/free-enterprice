import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GMAIL_USER = "prospertaku098@gmail.com";
const GMAIL_APP_PASS = "amag lmjh nrbu gamy";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { action, featureId, featureType, name, description, codeUrl } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server config error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "add_sandbox_feature") {
      // Add new feature to sandbox for testing
      const res = await fetch(`${supabaseUrl}/rest/v1/sandbox_features`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          feature_id: featureId,
          feature_type: featureType,
          name,
          description,
          code_url: codeUrl,
          status: "testing",
        }),
      });

      if (!res.ok) {
        return new Response(JSON.stringify({ error: "Failed to add feature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Send notification email
      try {
        const nodemailer = await import("npm:nodemailer@6.9.16");
        const transporter = nodemailer.default.createTransport({
          service: "gmail",
          auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS },
        });

        await transporter.sendMail({
          from: GMAIL_USER,
          to: GMAIL_USER,
          subject: `[Free File Wizard Sandbox] New ${featureType}: ${name}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#00f0ff;">New Sandbox Feature Available</h2>
              <table style="border-collapse:collapse;width:100%;">
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Type</td><td style="padding:8px;border:1px solid #ddd;">${featureType}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Description</td><td style="padding:8px;border:1px solid #ddd;">${description}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Code URL</td><td style="padding:8px;border:1px solid #ddd;"><a href="${codeUrl}">${codeUrl}</a></td></tr>
              </table>
              <p style="margin-top:16px;color:#888;font-size:12px;">Users can now test this feature in sandbox mode. Monitor feedback and deploy when ready!</p>
            </div>
          `,
        });
      } catch (e) {
        console.error("Notification email failed:", e);
      }

      return new Response(JSON.stringify({ success: true, message: "Feature added to sandbox" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "deploy_to_live") {
      // Deploy sandbox feature to live app
      const res = await fetch(
        `${supabaseUrl}/rest/v1/sandbox_features?feature_id=eq.${featureId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "apikey": serviceRoleKey,
            "Authorization": `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            status: "live",
            deployed_at: new Date().toISOString(),
          }),
        }
      );

      if (!res.ok) {
        return new Response(JSON.stringify({ error: "Deploy failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch feedback for notification
      const feedbackRes = await fetch(
        `${supabaseUrl}/rest/v1/sandbox_feedback?sandbox_feature_id=eq.${featureId}`,
        {
          headers: {
            "apikey": serviceRoleKey,
            "Authorization": `Bearer ${serviceRoleKey}`,
          },
        }
      );
      const feedbackData = await feedbackRes.json();

      // Send deployment notification
      try {
        const nodemailer = await import("npm:nodemailer@6.9.16");
        const transporter = nodemailer.default.createTransport({
          service: "gmail",
          auth: { user: GMAIL_USER, pass: GMAIL_APP_PASS },
        });

        const feedbackSummary = feedbackData.length
          ? `${feedbackData.filter((f: any) => f.feature_status === "works_well").length} ✓ working well | ${feedbackData.filter((f: any) => f.feature_status === "has_bugs").length} ⚠ has bugs`
          : "No feedback yet";

        await transporter.sendMail({
          from: GMAIL_USER,
          to: GMAIL_USER,
          subject: `[Free File Wizard] DEPLOYED: ${name} is now LIVE!`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#10b981;">Feature Deployed to Live App!</h2>
              <p><strong>${name}</strong> (${featureType}) is now available to all users.</p>
              <h3>Sandbox Feedback Summary:</h3>
              <p>${feedbackSummary}</p>
              <p style="margin-top:16px;color:#888;font-size:12px;">All users now have access to this feature.</p>
            </div>
          `,
        });
      } catch (e) {
        console.error("Deploy notification failed:", e);
      }

      return new Response(JSON.stringify({ success: true, message: "Feature deployed to live app" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("sandbox-deploy error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
