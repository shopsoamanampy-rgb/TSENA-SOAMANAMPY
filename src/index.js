export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    try {
      if (pathname === "/api/operations" && request.method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM operations ORDER BY date DESC, heure DESC"
        ).all();
        return Response.json({ ok: true, data: results });
      }

      if (pathname.startsWith("/api/operations/") && request.method === "GET") {
        const id = pathname.split("/").pop();
        const row = await env.DB.prepare(
          "SELECT * FROM operations WHERE id = ?"
        ).bind(id).first();
        return Response.json({ ok: true, data: row || null });
      }

      if (pathname === "/api/operations" && request.method === "POST") {
        const body = await request.json();
        const id = body.id || crypto.randomUUID();

        await env.DB.prepare(
          `INSERT INTO operations (
            id, type, date, heure, nom, prenom, contact, adresse, source, spOk,
            statut, numCarte, numDecodeur, bouquet, montant,
            commissionToi, commissionSource, commissionTech
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          body.type || "",
          body.date || "",
          body.heure || "",
          body.nom || "",
          body.prenom || "",
          body.contact || "",
          body.adresse || "",
          body.source || "",
          body.spOk ?? 0,
          body.statut || "En attente",
          body.numCarte || "",
          body.numDecodeur || "",
          body.bouquet || "",
          body.montant ?? null,
          body.commissionToi ?? 0,
          body.commissionSource ?? 0,
          body.commissionTech ?? 0
        ).run();

        return Response.json({ ok: true, id });
      }

      if (pathname.startsWith("/api/operations/") && request.method === "PUT") {
        const id = pathname.split("/").pop();
        const body = await request.json();

        await env.DB.prepare(
          `UPDATE operations SET
            type = ?, date = ?, heure = ?, nom = ?, prenom = ?, contact = ?,
            adresse = ?, source = ?, spOk = ?, statut = ?, numCarte = ?, numDecodeur = ?,
            bouquet = ?, montant = ?, commissionToi = ?, commissionSource = ?, commissionTech = ?
          WHERE id = ?`
        ).bind(
          body.type || "",
          body.date || "",
          body.heure || "",
          body.nom || "",
          body.prenom || "",
          body.contact || "",
          body.adresse || "",
          body.source || "",
          body.spOk ?? 0,
          body.statut || "En attente",
          body.numCarte || "",
          body.numDecodeur || "",
          body.bouquet || "",
          body.montant ?? null,
          body.commissionToi ?? 0,
          body.commissionSource ?? 0,
          body.commissionTech ?? 0,
          id
        ).run();

        return Response.json({ ok: true });
      }

      if (pathname.startsWith("/api/operations/") && request.method === "DELETE") {
        const id = pathname.split("/").pop();
        await env.DB.prepare("DELETE FROM operations WHERE id = ?").bind(id).run();
        return Response.json({ ok: true });
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      return Response.json({ ok: false, error: String(error) }, { status: 500 });
    }
  }
}
