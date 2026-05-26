import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + "_" + btoa(password.slice(0, 3));
}

function generateCodeName(ip: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let seed = 0;
  for (let i = 0; i < ip.length; i++) {
    seed = ((seed << 5) - seed) + ip.charCodeAt(i);
    seed = seed & seed;
  }
  const rng = (n: number) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % n;
  };
  let code = "";
  for (let i = 0; i < 20; i++) {
    code += chars[rng(chars.length)];
  }
  return code;
}

function generateStrongPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const nums = "23456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + nums + symbols;
  let pwd = "";
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += nums[Math.floor(Math.random() * nums.length)];
  pwd += symbols[Math.floor(Math.random() * symbols.length)];
  for (let i = 4; i < 16; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // GENERATE CODE NAME from IP
    if (action === "generate_codename" && req.method === "POST") {
      const body = await req.json();
      const { ip } = body;
      if (!ip) {
        return new Response(JSON.stringify({ error: "IP required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const codeName = generateCodeName(ip);

      // Check if account already exists for this code_name
      const checkRes = await fetch(`${supabaseUrl}/rest/v1/user_accounts?code_name=eq.${codeName}&select=code_name,email,display_name`, { headers });
      const existing = await checkRes.json();

      return new Response(JSON.stringify({
        codeName,
        existing: existing?.length > 0 || false,
        account: existing?.[0] || null,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GENERATE STRONG PASSWORD
    if (action === "generate_password" && req.method === "GET") {
      return new Response(JSON.stringify({ password: generateStrongPassword() }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SIGN UP
    if (action === "signup" && req.method === "POST") {
      const body = await req.json();
      const { codeName, email, password, displayName, ip } = body;

      if (!codeName || !email || !password) {
        return new Response(JSON.stringify({ error: "Code name, email, and password required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if email already taken
      const emailCheck = await fetch(`${supabaseUrl}/rest/v1/user_accounts?email=eq.${encodeURIComponent(email)}&select=id`, { headers });
      const emailExists = await emailCheck.json();
      if (emailExists?.length > 0) {
        return new Response(JSON.stringify({ error: "Email already registered" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const passwordHash = hashPassword(password);
      const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const insertRes = await fetch(`${supabaseUrl}/rest/v1/user_accounts`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          code_name: codeName,
          email,
          password_hash: passwordHash,
          display_name: displayName || email.split("@")[0],
          ip_fingerprint: ip || "",
          session_expires: sessionExpires,
        }),
      });

      if (!insertRes.ok) {
        const err = await insertRes.json();
        return new Response(JSON.stringify({ error: err.message || "Signup failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Log the signup action
      await fetch(`${supabaseUrl}/rest/v1/user_actions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          code_name: codeName,
          action_type: "signup",
          action_detail: `Account created: ${email}`,
          ip_address: ip || "",
        }),
      });

      // Welcome suggestion
      await fetch(`${supabaseUrl}/rest/v1/user_suggestions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          code_name: codeName,
          suggestion_type: "guide",
          title: "Welcome to Free File Wizard!",
          content: "Your account is ready. Explore the advanced tools available to signed-in users. Add games, websites, or databases to the platform, or join the shared ads program.",
        }),
      });

      return new Response(JSON.stringify({
        success: true,
        codeName,
        email,
        sessionExpires,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SIGN IN
    if (action === "signin" && req.method === "POST") {
      const body = await req.json();
      const { codeName, email, password, ip } = body;

      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Email and password required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find account by email
      const accRes = await fetch(`${supabaseUrl}/rest/v1/user_accounts?email=eq.${encodeURIComponent(email)}&select=*`, { headers });
      const accounts = await accRes.json();
      const account = accounts?.[0];

      if (!account) {
        return new Response(JSON.stringify({ error: "Account not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (account.is_banned) {
        return new Response(JSON.stringify({ error: `Account suspended: ${account.ban_reason || "Rule violation"}` }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify password
      const inputHash = hashPassword(password);
      if (inputHash !== account.password_hash) {
        // Log failed attempt
        await fetch(`${supabaseUrl}/rest/v1/user_actions`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            code_name: account.code_name,
            action_type: "hack_attempt",
            action_detail: "Failed login attempt",
            ip_address: ip || "",
          }),
        });

        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update session
      const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await fetch(`${supabaseUrl}/rest/v1/user_accounts?code_name=eq.${account.code_name}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ session_expires: newExpiry, last_login: new Date().toISOString() }),
      });

      // Log login
      await fetch(`${supabaseUrl}/rest/v1/user_actions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          code_name: account.code_name,
          action_type: "login",
          action_detail: "Successful login",
          ip_address: ip || "",
        }),
      });

      return new Response(JSON.stringify({
        success: true,
        account: {
          codeName: account.code_name,
          email: account.email,
          displayName: account.display_name,
          isPartner: account.is_partner,
          partnerStatus: account.partner_status,
          balance: account.balance,
          sessionExpires: newExpiry,
        },
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET ACCOUNT INFO
    if (action === "get_account" && req.method === "POST") {
      const body = await req.json();
      const { codeName } = body;

      const accRes = await fetch(`${supabaseUrl}/rest/v1/user_accounts?code_name=eq.${codeName}&select=*`, { headers });
      const accounts = await accRes.json();
      const account = accounts?.[0];

      if (!account) {
        return new Response(JSON.stringify({ error: "Account not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check session expiry
      const isExpired = account.session_expires && new Date(account.session_expires) < new Date();

      return new Response(JSON.stringify({
        account: {
          codeName: account.code_name,
          email: account.email,
          displayName: account.display_name,
          isPartner: account.is_partner,
          partnerStatus: account.partner_status,
          balance: account.balance,
          totalEarned: account.total_earned,
          totalPaid: account.total_paid,
          warningCount: account.warning_count,
          isBanned: account.is_banned,
          sessionExpires: account.session_expires,
          sessionExpired: isExpired,
        },
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LOG USER ACTION
    if (action === "log_action" && req.method === "POST") {
      const body = await req.json();
      const { codeName, actionType, actionDetail, ip } = body;

      await fetch(`${supabaseUrl}/rest/v1/user_actions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          code_name: codeName || "anonymous",
          action_type: actionType,
          action_detail: actionDetail || "",
          ip_address: ip || "",
        }),
      });

      // If hack attempt or rule violation, increment warning
      if (["hack_attempt", "rule_violation"].includes(actionType) && codeName) {
        const accRes = await fetch(`${supabaseUrl}/rest/v1/user_accounts?code_name=eq.${codeName}&select=warning_count,is_banned`, { headers });
        const accounts = await accRes.json();
        const account = accounts?.[0];

        if (account) {
          const newWarningCount = (account.warning_count || 0) + 1;
          const shouldBan = newWarningCount >= 5;

          await fetch(`${supabaseUrl}/rest/v1/user_accounts?code_name=eq.${codeName}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              warning_count: newWarningCount,
              is_banned: shouldBan ? true : account.is_banned,
              ban_reason: shouldBan ? "Automatic ban: 5+ rule violations" : "",
            }),
          });

          // Send warning suggestion
          if (!shouldBan) {
            await fetch(`${supabaseUrl}/rest/v1/user_suggestions`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                code_name: codeName,
                suggestion_type: "warning",
                title: `Warning #${newWarningCount}: ${actionType.replace("_", " ")}`,
                content: `Your action was flagged: ${actionDetail}. You have ${5 - newWarningCount} warnings remaining before your account is automatically suspended.`,
              }),
            });
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET SUGGESTIONS FOR USER
    if (action === "get_suggestions" && req.method === "GET") {
      const codeName = url.searchParams.get("codeName");
      if (!codeName) {
        return new Response(JSON.stringify({ error: "codeName required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const sugRes = await fetch(`${supabaseUrl}/rest/v1/user_suggestions?code_name=eq.${codeName}&is_read=eq.false&order=created_at.desc&limit=10`, { headers });
      const suggestions = await sugRes.json();

      return new Response(JSON.stringify({ suggestions }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SUBMIT TOOL (game/website/database)
    if (action === "submit_tool" && req.method === "POST") {
      const body = await req.json();
      const { codeName, submissionType, name, description, url, category, techStack, screenshotUrl, demoUrl, sourceCodeUrl, licenseType, privacyPolicyUrl, termsUrl, supportEmail, version } = body;

      if (!codeName || !submissionType || !name || !description || !url || !category) {
        return new Response(JSON.stringify({ error: "Required fields missing: codeName, submissionType, name, description, url, category" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await fetch(`${supabaseUrl}/rest/v1/user_submissions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          code_name: codeName,
          submission_type: submissionType,
          name,
          description,
          url,
          category,
          tech_stack: techStack || "",
          screenshot_url: screenshotUrl || "",
          demo_url: demoUrl || "",
          source_code_url: sourceCodeUrl || "",
          license_type: licenseType || "",
          privacy_policy_url: privacyPolicyUrl || "",
          terms_url: termsUrl || "",
          support_email: supportEmail || "",
          version: version || "",
        }),
      });

      // Log action
      await fetch(`${supabaseUrl}/rest/v1/user_actions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          code_name: codeName,
          action_type: "submission",
          action_detail: `Submitted ${submissionType}: ${name}`,
        }),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SAVE BANK DETAILS (for partner payout)
    if (action === "save_bank" && req.method === "POST") {
      const body = await req.json();
      const { codeName, bankName, accountNumber, accountName, routingNumber, swiftCode } = body;

      if (!codeName || !bankName || !accountNumber || !accountName) {
        return new Response(JSON.stringify({ error: "Bank name, account number, and account holder name required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Store encrypted bank details (masked in response)
      await fetch(`${supabaseUrl}/rest/v1/user_accounts?code_name=eq.${codeName}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          bank_details: {
            bankName,
            accountNumber: accountNumber.slice(-4).padStart(accountNumber.length, "*"),
            accountName,
            routingNumber: routingNumber || "",
            swiftCode: swiftCode || "",
            _full_account: btoa(accountNumber),
            updated_at: new Date().toISOString(),
          },
        }),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // REQUEST WITHDRAWAL (updated: $100 minimum)
    if (action === "request_withdrawal" && req.method === "POST") {
      const body = await req.json();
      const { codeName, amount } = body;

      if (!codeName || !amount) {
        return new Response(JSON.stringify({ error: "codeName and amount required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const numericAmount = parseFloat(amount);
      if (numericAmount < 100) {
        return new Response(JSON.stringify({ error: "Minimum withdrawal is $100" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get account balance
      const accRes = await fetch(`${supabaseUrl}/rest/v1/user_accounts?code_name=eq.${codeName}&select=balance,bank_details,partner_status`, { headers });
      const accounts = await accRes.json();
      const account = accounts?.[0];

      if (!account) {
        return new Response(JSON.stringify({ error: "Account not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (account.partner_status !== "approved") {
        return new Response(JSON.stringify({ error: "Only approved partners can withdraw" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (parseFloat(account.balance) < numericAmount) {
        return new Response(JSON.stringify({ error: "Insufficient balance" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!account.bank_details || Object.keys(account.bank_details).length === 0) {
        return new Response(JSON.stringify({ error: "Bank details required. Please add your bank information first." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create withdrawal request
      await fetch(`${supabaseUrl}/rest/v1/withdrawal_requests`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          partner_id: codeName,
          amount: numericAmount,
          status: "pending",
        }),
      });

      // Deduct from balance
      const newBalance = parseFloat(account.balance) - numericAmount;
      await fetch(`${supabaseUrl}/rest/v1/user_accounts?code_name=eq.${codeName}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ balance: newBalance }),
      });

      return new Response(JSON.stringify({ success: true, newBalance }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // JOIN PARTNER PROGRAM
    if (action === "join_partner" && req.method === "POST") {
      const body = await req.json();
      const { codeName } = body;

      if (!codeName) {
        return new Response(JSON.stringify({ error: "codeName required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await fetch(`${supabaseUrl}/rest/v1/user_accounts?code_name=eq.${codeName}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ is_partner: true, partner_status: "pending" }),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ADMIN: Get all user accounts
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
      if (banReason) patchData.ban_reason = banReason;

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

    // ADMIN: Get all user submissions
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

      // If approved, add to community submissions or tool hub
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
    console.error("user-auth error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
