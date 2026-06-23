export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    try {
      if (pathname === "/" || pathname === "/index.html") {
        return new Response("TSENA-SOAMANAMPY OK", {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }

      if (pathname === "/api/operations" && request.method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM operations ORDER BY date DESC, heure DESC"
        ).all();
        return Response.json({ ok: true, data: results });
      }

      return new Response("Not found", { status: 404 });
    } catch (error) {
      return Response.json(
        { ok: false, error: String(error) },
        { status: 500 }
      );
    }
  }
}
