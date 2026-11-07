
export async function onRequest(context) {
  const { request, env } = context;

  if (!env.API) {
    return Response.json(
      {
        ok: false,
        error: "API service binding missing"
      },
      { status: 503 }
    );
  }

  try {
    return await env.API.fetch(request);
  } catch (error) {
    console.error("API proxy error:", error);

    return Response.json(
      {
        ok: false,
        error: "API service unavailable"
      },
      { status: 502 }
    );
  }
}
