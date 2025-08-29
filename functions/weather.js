export async function onRequestGet({ request, env }) {
    const urlIn = new URL(request.url);
  
    // parámetros que acepta el frontend
    const q   = urlIn.searchParams.get("q");    // ciudad (ej: "Córdoba,AR")
    const lat = urlIn.searchParams.get("lat");  // coordenadas opcionales
    const lon = urlIn.searchParams.get("lon");
    const units = urlIn.searchParams.get("units") || "metric";
    const lang  = urlIn.searchParams.get("lang")  || "es";
  
    // construyo los parámetros para la API real
    const params = new URLSearchParams({
      units,
      lang,
      appid: env.OWM_API_KEY   // tu API key, tomada de las variables de entorno
    });
    if (q) {
      params.set("q", q);
    }
    if (lat && lon) {
      params.set("lat", lat);
      params.set("lon", lon);
    }
  
    const owUrl = `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`;
  
    // llamo a OpenWeather
    const resp = await fetch(owUrl);
    const data = await resp.text();
  
    // devuelvo la respuesta al navegador
    return new Response(data, {
      status: resp.status,
      headers: {
        "content-type": "application/json",
        "cache-control": "private, max-age=60"
      }
    });
  }
  