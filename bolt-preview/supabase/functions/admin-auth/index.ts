import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_ACCOUNTS = [
  { email: "prospertaku098@gmail.com", password: "BigApple098@", role: "owner" },
  { email: "jeepsyearth@gmail.com", password: "Taku", role: "admin" },
  { email: "shawndemitrix@gmail.com", password: "God the Father", role: "admin" },
];

const SESSION_SECRET = "ffw_admin_session_2026_secure";

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function generateToken(email: string): string {
  const payload = {
    email,
    role: ADMIN_ACCOUNTS.find(a => a.email === email)?.role || "admin",
    ts: Date.now(),
    hash: hashPassword(email + SESSION_SECRET + Date.now()),
  };
  return btoa(JSON.stringify(payload));
}

function verifyToken(token: string): { email: string; role: string; ts: number } | null {
  try {
    const decoded = JSON.parse(atob(token));
    const admin = ADMIN_ACCOUNTS.find(a => a.email === decoded.email);
    if (!admin) return null;
    if (Date.now() - decoded.ts > 24 * 60 * 60 * 1000) return null;
    return decoded;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // LOGIN
    if (action === "login" && req.method === "POST") {
      const body = await req.json();
      const { email, password } = body;

      const admin = ADMIN_ACCOUNTS.find(
        a => a.email === email && a.password === password
      );

      if (!admin) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const token = generateToken(admin.email);

      return new Response(JSON.stringify({
        success: true,
        token,
        role: admin.role,
        email: admin.email,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // VERIFY TOKEN
    if (action === "verify" && req.method === "GET") {
      const authHeader = req.headers.get("Authorization");
      const token = authHeader?.replace("Bearer ", "");

      if (!token) {
        return new Response(JSON.stringify({ error: "No token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, ...decoded }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ALL ADMIN ACTIONS REQUIRE AUTH
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const decoded = verifyToken(token || "");

    if (!decoded) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server config error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const headers = {
      "Content-Type": "application/json",
      "apikey": serviceRoleKey,
      "Authorization": `Bearer ${serviceRoleKey}`,
    };

    // GET DASHBOARD DATA
    if (action === "dashboard" && req.method === "GET") {
      const [feedback, reviews, submissions, partners, withdrawals, sandbox, sandboxFeedback, analytics] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/feedback?order=created_at.desc&limit=50`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/reviews?order=created_at.desc&limit=50`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/community_submissions?order=created_at.desc`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/ad_partners?order=created_at.desc`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/withdrawal_requests?order=created_at.desc`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/sandbox_features?order=created_at.desc`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/sandbox_feedback?order=created_at.desc&limit=100`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/tool_analytics?select=tool_id,action,created_at&order=created_at.desc&limit=500`, { headers }).then(r => r.json()),
      ]);

      return new Response(JSON.stringify({
        feedback, reviews, submissions, partners, withdrawals,
        sandbox, sandboxFeedback, analytics,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MANAGE SUBMISSIONS
    if (action === "manage_submission" && req.method === "POST") {
      const body = await req.json();
      const { id, status } = body;

      if (!id || !["approved", "rejected"].includes(status)) {
        return new Response(JSON.stringify({ error: "Invalid parameters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await fetch(`${supabaseUrl}/rest/v1/community_submissions?id=eq.${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MANAGE PARTNERS
    if (action === "manage_partner" && req.method === "POST") {
      const body = await req.json();
      const { id, status } = body;

      if (!id || !["approved", "rejected", "suspended"].includes(status)) {
        return new Response(JSON.stringify({ error: "Invalid parameters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const patchData: Record<string, unknown> = { status };
      if (status === "approved") patchData.approved_at = new Date().toISOString();

      await fetch(`${supabaseUrl}/rest/v1/ad_partners?id=eq.${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(patchData),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MANAGE WITHDRAWALS
    if (action === "manage_withdrawal" && req.method === "POST") {
      const body = await req.json();
      const { id, status } = body;

      if (!id || !["approved", "processing", "paid", "rejected"].includes(status)) {
        return new Response(JSON.stringify({ error: "Invalid parameters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const patchData: Record<string, unknown> = { status };
      if (status === "approved") patchData.approved_at = new Date().toISOString();
      if (status === "paid") patchData.paid_at = new Date().toISOString();

      await fetch(`${supabaseUrl}/rest/v1/withdrawal_requests?id=eq.${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(patchData),
      });

      // If paid, update partner balance
      if (status === "paid") {
        const wrRes = await fetch(`${supabaseUrl}/rest/v1/withdrawal_requests?id=eq.${id}`, { headers });
        const wrs = await wrRes.json();
        const wr = wrs?.[0];

        if (wr) {
          const pRes = await fetch(`${supabaseUrl}/rest/v1/ad_partners?id=eq.${wr.partner_id}`, { headers });
          const partners = await pRes.json();
          const partner = partners?.[0];

          if (partner) {
            const newTotalPaid = Number(partner.total_paid || 0) + Number(wr.amount);
            const newBalance = Math.max(0, Number(partner.balance || 0) - Number(wr.amount));

            await fetch(`${supabaseUrl}/rest/v1/ad_partners?id=eq.${wr.partner_id}`, {
              method: "PATCH",
              headers,
              body: JSON.stringify({ total_paid: newTotalPaid, balance: newBalance }),
            });
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MANAGE FEEDBACK
    if (action === "manage_feedback" && req.method === "POST") {
      const body = await req.json();
      const { id, resolved } = body;

      await fetch(`${supabaseUrl}/rest/v1/feedback?id=eq.${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ resolved }),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MANAGE REVIEWS
    if (action === "manage_review" && req.method === "POST") {
      const body = await req.json();
      const { id, action: reviewAction } = body;

      if (reviewAction === "delete") {
        await fetch(`${supabaseUrl}/rest/v1/reviews?id=eq.${id}`, {
          method: "DELETE",
          headers,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MANAGE SANDBOX FEATURES
    if (action === "manage_sandbox" && req.method === "POST") {
      const body = await req.json();
      const { id, status, featureId, featureType, name, description, codeUrl } = body;

      if (status && id) {
        const patchData: Record<string, unknown> = { status };
        if (status === "live") patchData.deployed_at = new Date().toISOString();

        await fetch(`${supabaseUrl}/rest/v1/sandbox_features?id=eq.${id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(patchData),
        });
      } else if (featureId) {
        await fetch(`${supabaseUrl}/rest/v1/sandbox_features`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            feature_id: featureId,
            feature_type: featureType,
            name,
            description: description || "",
            code_url: codeUrl || "",
            status: "testing",
          }),
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // BAN / UNBAN USERS (by email pattern)
    if (action === "ban_user" && req.method === "POST") {
      const body = await req.json();
      const { email, table, ban } = body;

      if (ban) {
        // Reject all submissions from this email
        if (table === "submissions" || table === "all") {
          await fetch(`${supabaseUrl}/rest/v1/community_submissions?submitter_email=eq.${email}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ status: "rejected" }),
          });
        }
        if (table === "partners" || table === "all") {
          await fetch(`${supabaseUrl}/rest/v1/ad_partners?email=eq.${email}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ status: "suspended" }),
          });
        }
      } else {
        // Unban - restore to pending
        if (table === "partners" || table === "all") {
          await fetch(`${supabaseUrl}/rest/v1/ad_partners?email=eq.${email}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ status: "pending" }),
          });
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("admin-auth error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
