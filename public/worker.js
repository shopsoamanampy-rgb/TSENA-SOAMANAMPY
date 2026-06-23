export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    if (pathname !== '/api/operations' && !pathname.startsWith('/api/operations/')) {
      return new Response('Not found', { status: 404 });
    }

    if (method === 'GET' && pathname === '/api/operations') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM operations ORDER BY date DESC, heure DESC'
      ).all();

      return Response.json({ results });
    }

    if (method === 'POST' && pathname === '/api/operations') {
      const op = await request.json();

      await env.DB.prepare(`
        INSERT INTO operations (
          id, type, statut, date, heure, nom, prenom, contact, source,
          technicien, adresse, spOk, numCarte, numDecodeur, bouquet,
          montant, commissionToi, commissionSource, commissionTech
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        op.id,
        op.type,
        op.statut,
        op.date,
        op.heure,
        op.nom,
        op.prenom,
        op.contact,
        op.source,
        op.technicien,
        op.adresse,
        op.spOk ? 1 : 0,
        op.numCarte,
        op.numDecodeur,
        op.bouquet,
        Number(op.montant || 0),
        Number(op.commissionToi || 0),
        Number(op.commissionSource || 0),
        Number(op.commissionTech || 0)
      ).run();

      return Response.json({ ok: true });
    }

    if (method === 'PUT' && pathname.startsWith('/api/operations/')) {
      const id = pathname.split('/').pop();
      const op = await request.json();

      await env.DB.prepare(`
        UPDATE operations
        SET type = ?, statut = ?, date = ?, heure = ?, nom = ?, prenom = ?, contact = ?, source = ?,
            technicien = ?, adresse = ?, spOk = ?, numCarte = ?, numDecodeur = ?, bouquet = ?,
            montant = ?, commissionToi = ?, commissionSource = ?, commissionTech = ?
        WHERE id = ?
      `).bind(
        op.type,
        op.statut,
        op.date,
        op.heure,
        op.nom,
        op.prenom,
        op.contact,
        op.source,
        op.technicien,
        op.adresse,
        op.spOk ? 1 : 0,
        op.numCarte,
        op.numDecodeur,
        op.bouquet,
        Number(op.montant || 0),
        Number(op.commissionToi || 0),
        Number(op.commissionSource || 0),
        Number(op.commissionTech || 0),
        id
      ).run();

      return Response.json({ ok: true });
    }

    if (method === 'DELETE' && pathname.startsWith('/api/operations/')) {
      const id = pathname.split('/').pop();

      await env.DB.prepare(
        'DELETE FROM operations WHERE id = ?'
      ).bind(id).run();

      return Response.json({ ok: true });
    }

    return new Response('Method not allowed', { status: 405 });
  }
};
