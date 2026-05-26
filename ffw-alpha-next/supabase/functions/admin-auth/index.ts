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

      const decoded = verifyToken(token || "");
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
      const [feedback, reviews, submissions, partners, withdrawals, sandbox, sandboxFeedback, analytics, stagingFeatures, stagingFeedback, stagingDeployments, connectionAudit] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/feedback?order=created_at.desc&limit=50`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/reviews?order=created_at.desc&limit=50`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/community_submissions?order=created_at.desc`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/ad_partners?order=created_at.desc`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/withdrawal_requests?order=created_at.desc`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/sandbox_features?order=created_at.desc`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/sandbox_feedback?order=created_at.desc&limit=100`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/tool_analytics?select=tool_id,action,created_at&order=created_at.desc&limit=500`, { headers }).then(r => r.json()),
        fetch(`${supabaseUrl}/rest/v1/staging_sandbox_features?order=created_at.desc`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`${supabaseUrl}/rest/v1/staging_sandbox_feedback?order=created_at.desc&limit=100`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`${supabaseUrl}/rest/v1/staging_staging_deployments?order=created_at.desc`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`${supabaseUrl}/rest/v1/staging_connection_audit?order=created_at.desc&limit=50`, { headers }).then(r => r.json()).catch(() => []),
      ]);

      return new Response(JSON.stringify({
        feedback, reviews, submissions, partners, withdrawals,
        sandbox, sandboxFeedback, analytics,
        stagingFeatures, stagingFeedback, stagingDeployments, connectionAudit,
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

        // Log the deployment
        await fetch(`${supabaseUrl}/rest/v1/staging_staging_deployments`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            feature_id: featureId || id,
            action: status === "live" ? "promote_to_live" : status === "archived" ? "archive" : "status_change",
            admin_email: decoded.email,
            notes: `Status changed to ${status}`,
          }),
        });
      } else if (featureId) {
        // Add to both public sandbox_features and staging.sandbox_features
        const featureData = {
          feature_id: featureId,
          feature_type: featureType,
          name,
          description: description || "",
          code_url: codeUrl || "",
          status: "testing",
        };

        await fetch(`${supabaseUrl}/rest/v1/sandbox_features`, {
          method: "POST",
          headers,
          body: JSON.stringify(featureData),
        });

        // Also add to staging for isolated testing
        await fetch(`${supabaseUrl}/rest/v1/staging_sandbox_features`, {
          method: "POST",
          headers,
          body: JSON.stringify(featureData),
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PROMOTE STAGING FEATURE TO PRODUCTION
    if (action === "promote_to_production" && req.method === "POST") {
      const body = await req.json();
      const { featureId } = body;

      // Get the staging feature
      const stRes = await fetch(`${supabaseUrl}/rest/v1/staging_sandbox_features?feature_id=eq.${featureId}`, { headers });
      const stagingFeatures = await stRes.json();
      const stagingFeature = stagingFeatures?.[0];

      if (!stagingFeature) {
        return new Response(JSON.stringify({ error: "Staging feature not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get feedback summary
      const fbRes = await fetch(`${supabaseUrl}/rest/v1/staging_sandbox_feedback?staging_feature_id=eq.${stagingFeature.id}`, { headers });
      const feedbacks = await fbRes.json();

      const totalFeedback = feedbacks.length;
      const worksWell = feedbacks.filter((f: any) => f.feature_status === "works_well").length;
      const hasBugs = feedbacks.filter((f: any) => f.feature_status === "has_bugs").length;
      const broken = feedbacks.filter((f: any) => f.feature_status === "broken").length;
      const avgRating = totalFeedback > 0
        ? (feedbacks.reduce((a: number, b: any) => a + (b.rating || 0), 0) / totalFeedback).toFixed(1)
        : "N/A";

      // Update staging feature to approved_for_live
      await fetch(`${supabaseUrl}/rest/v1/staging_sandbox_features?feature_id=eq.${featureId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          status: "approved_for_live",
          test_results: { totalFeedback, worksWell, hasBugs, broken, avgRating },
          promoted_by: decoded.email,
        }),
      });

      // Promote to public sandbox_features as live
      const publicRes = await fetch(`${supabaseUrl}/rest/v1/sandbox_features?feature_id=eq.${featureId}`, { headers });
      const publicFeatures = await publicRes.json();

      if (publicFeatures?.length > 0) {
        await fetch(`${supabaseUrl}/rest/v1/sandbox_features?feature_id=eq.${featureId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: "live", deployed_at: new Date().toISOString() }),
        });
      } else {
        await fetch(`${supabaseUrl}/rest/v1/sandbox_features`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            feature_id: stagingFeature.feature_id,
            feature_type: stagingFeature.feature_type,
            name: stagingFeature.name,
            description: stagingFeature.description,
            code_url: stagingFeature.code_url,
            status: "live",
            deployed_at: new Date().toISOString(),
          }),
        });
      }

      // Log the promotion
      await fetch(`${supabaseUrl}/rest/v1/staging_staging_deployments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          feature_id: featureId,
          action: "promote_to_live",
          admin_email: decoded.email,
          notes: `Feedback: ${totalFeedback} total, ${worksWell} works well, ${hasBugs} has bugs, ${broken} broken. Avg rating: ${avgRating}`,
        }),
      });

      return new Response(JSON.stringify({
        success: true,
        promotion: { featureId, totalFeedback, worksWell, hasBugs, broken, avgRating },
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ROLLBACK A FEATURE FROM LIVE
    if (action === "rollback_feature" && req.method === "POST") {
      const body = await req.json();
      const { featureId, reason } = body;

      // Set public feature back to testing
      await fetch(`${supabaseUrl}/rest/v1/sandbox_features?feature_id=eq.${featureId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: "testing", deployed_at: null }),
      });

      // Set staging feature to rolled_back
      await fetch(`${supabaseUrl}/rest/v1/staging_sandbox_features?feature_id=eq.${featureId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: "rolled_back" }),
      });

      // Log the rollback
      await fetch(`${supabaseUrl}/rest/v1/staging_staging_deployments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          feature_id: featureId,
          action: "rollback",
          admin_email: decoded.email,
          notes: reason || "Rolled back by admin",
        }),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // AUDIT SELF-HOSTED CONNECTION
    if (action === "audit_connection" && req.method === "POST") {
      const body = await req.json();
      const { connectionUrl, anonKeyFingerprint, status, reason } = body;

      await fetch(`${supabaseUrl}/rest/v1/staging_connection_audit`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          connection_url: connectionUrl,
          anon_key_fingerprint: anonKeyFingerprint || "",
          status: status || "attempted",
          reason: reason || "",
        }),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // REVOKE SELF-HOSTED CONNECTION
    if (action === "revoke_connection" && req.method === "POST") {
      const body = await req.json();
      const { connectionUrl } = body;

      // Log the revocation
      await fetch(`${supabaseUrl}/rest/v1/staging_connection_audit`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          connection_url: connectionUrl,
          status: "revoked",
          reason: `Revoked by admin ${decoded.email}`,
        }),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // BAN / UNBAN USERS
    if (action === "ban_user" && req.method === "POST") {
      const body = await req.json();
      const { email, table, ban } = body;

      if (ban) {
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

    // ADMIN POSTS - Create / Update / Delete
    if (action === "manage_post" && req.method === "POST") {
      const body = await req.json();
      const { id, postAction, title, content, mediaUrl, mediaType, category, status } = body;

      if (postAction === "create") {
        await fetch(`${supabaseUrl}/rest/v1/admin_posts`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            admin_email: decoded.email,
            title: title || "",
            content: content || "",
            media_url: mediaUrl || "",
            media_type: mediaType || "none",
            category: category || "announcement",
            status: status || "published",
          }),
        });
      } else if (postAction === "update" && id) {
        const patchData: Record<string, unknown> = {};
        if (title !== undefined) patchData.title = title;
        if (content !== undefined) patchData.content = content;
        if (mediaUrl !== undefined) patchData.media_url = mediaUrl;
        if (mediaType !== undefined) patchData.media_type = mediaType;
        if (category !== undefined) patchData.category = category;
        if (status !== undefined) patchData.status = status;
        await fetch(`${supabaseUrl}/rest/v1/admin_posts?id=eq.${id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(patchData),
        });
      } else if (postAction === "delete" && id) {
        await fetch(`${supabaseUrl}/rest/v1/admin_posts?id=eq.${id}`, {
          method: "DELETE",
          headers,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // INTERACT WITH POST (like, share, download)
    if (action === "interact_post" && req.method === "POST") {
      const body = await req.json();
      const { id, type } = body;

      if (!id || !["likes", "shares", "downloads"].includes(type)) {
        return new Response(JSON.stringify({ error: "Invalid parameters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Increment the counter
      await fetch(`${supabaseUrl}/rest/v1/admin_posts?id=eq.${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ [type]: Math.random() > 0 ? undefined : 0 }), // workaround
      });

      // Read-then-write for accurate increment
      const readRes = await fetch(`${supabaseUrl}/rest/v1/admin_posts?id=eq.${id}&select=${type}`, { headers });
      const readData = await readRes.json();
      const currentVal = readData?.[0]?.[type] || 0;
      await fetch(`${supabaseUrl}/rest/v1/admin_posts?id=eq.${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ [type]: currentVal + 1 }),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET ADMIN POSTS for dashboard
    if (action === "get_posts" && req.method === "GET") {
      const postsRes = await fetch(`${supabaseUrl}/rest/v1/admin_posts?order=created_at.desc`, { headers });
      const posts = await postsRes.json();

      return new Response(JSON.stringify(posts), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ADMIN: Get user accounts
    if (action === "admin_get_users" && req.method === "GET") {
      const accRes = await fetch(`${supabaseUrl}/rest/v1/user_accounts?order=created_at.desc&select=code_name,email,display_name,is_partner,partner_status,balance,warning_count,is_banned,created_at,last_login,ip_fingerprint`, { headers });
      const users = await accRes.json();
      return new Response(JSON.stringify({ users }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ADMIN: Manage user account
    if (action === "admin_manage_user" && req.method === "POST") {
      const body = await req.json();
      const { codeName, partnerStatus, isBanned, banReason } = body;
      const patchData: Record<string, unknown> = {};
      if (partnerStatus) patchData.partner_status = partnerStatus;
      if (isBanned !== undefined) patchData.is_banned = isBanned;
      if (banReason !== undefined) patchData.ban_reason = banReason;

      await fetch(`${supabaseUrl}/rest/v1/user_accounts?code_name=eq.${codeName}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(patchData),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ADMIN: Get user submissions
    if (action === "admin_get_submissions" && req.method === "GET") {
      const subRes = await fetch(`${supabaseUrl}/rest/v1/user_submissions?order=created_at.desc`, { headers });
      const submissions = await subRes.json();
      return new Response(JSON.stringify({ submissions }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ADMIN: Manage user submission
    if (action === "admin_manage_submission" && req.method === "POST") {
      const body = await req.json();
      const { id, status, rejectionReason, adminNotes } = body;
      const patchData: Record<string, unknown> = {};
      if (status) patchData.status = status;
      if (rejectionReason) patchData.rejection_reason = rejectionReason;
      if (adminNotes) patchData.admin_notes = adminNotes;

      await fetch(`${supabaseUrl}/rest/v1/user_submissions?id=eq.${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(patchData),
      });

      // If approved, add to community_submissions
      if (status === "approved") {
        const subRes = await fetch(`${supabaseUrl}/rest/v1/user_submissions?id=eq.${id}`, { headers });
        const subs = await subRes.json();
        const sub = subs?.[0];
        if (sub) {
          await fetch(`${supabaseUrl}/rest/v1/community_submissions`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              submitter_email: sub.code_name,
              tool_name: sub.name,
              tool_url: sub.url,
              tool_category: sub.category || sub.submission_type,
              description: sub.description,
              status: "approved",
            }),
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
