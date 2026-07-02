// Supabase Edge Function: delete-account
// Supprime DÉFINITIVEMENT le compte de l'utilisateur authentifié et ses données.
// Exigence App Store (Guideline 5.1.1(v)) : toute app qui crée un compte doit
// offrir une suppression de compte in-app.
//
// Auth : verify_jwt=true — l'appelant doit être connecté. On supprime UNIQUEMENT
// son propre compte (id dérivé du JWT), jamais celui d'un autre.

import { createClient } from "jsr:@supabase/supabase-js@2";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Server not configured." }, 500);

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Identifie l'utilisateur depuis son propre JWT.
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  const userId = userData?.user?.id;
  if (userErr || !userId) return json({ error: "Unauthorized" }, 401);

  // Supprime les données applicatives liées (best-effort ; certaines tables
  // cascadent déjà via FK on auth.users).
  await admin.from("profiles").delete().eq("id", userId);
  await admin.from("kie_daily_usage").delete().eq("user_id", userId);

  // Supprime le compte d'authentification (action irréversible).
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) {
    console.error("delete-account failed:", delErr.message);
    return json({ error: "Deletion failed" }, 500);
  }

  console.log(JSON.stringify({ service: "delete-account", deleted: userId }));
  return json({ deleted: true }, 200);
});
