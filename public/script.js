// ✅ CONFIG
const WEATHER_ENDPOINT = "/weather"; // Cloudflare Pages
// const WEATHER_ENDPOINT = "/.netlify/functions/weather"; // <-- Netlify (si lo usás)

document.getElementById("searchButton").addEventListener("click", onSearch);
document.getElementById("cityInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    onSearch();
  }
});

async function onSearch() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Ingrese una ciudad válida");
    return;
  }
  await fetchWeather(city);
}

async function fetchWeather(city) {
  const btn = document.getElementById("searchButton");
  const out = document.getElementById("responseData");

  // estado de carga
  btn.disabled = true;
  const prevBtnText = btn.textContent;
  btn.textContent = "Buscando...";
  out.innerHTML = "Cargando...";

  try {
    // 🔒 Sin API key en el front. La función serverless la agrega.
    const url = `${WEATHER_ENDPOINT}?q=${encodeURIComponent(city)}&units=metric&lang=es`;
    const res = await fetch(url, { headers: { "accept": "application/json" } });

    if (!res.ok) {
      // Ej.: 404 ciudad no encontrada
      const errText = await res.text().catch(() => "");
      throw new Error(`Error ${res.status}: ${errText || "no se pudo obtener el clima"}`);
    }

    const data = await res.json();
    showWeatherData(data);
  } catch (err) {
    console.error(err);
    showError(err);
  } finally {
    btn.disabled = false;
    btn.textContent = prevBtnText;
  }
}

function showWeatherData(data) {
  const div = document.getElementById("responseData");
  div.innerHTML = "";

  // Validaciones defensivas
  const cityName = data?.name ?? "—";
  const countryName = data?.sys?.country ?? "—";
  const temp = typeof data?.main?.temp === "number" ? Math.round(data.main.temp) : null;
  const humidity = data?.main?.humidity ?? "—";
  const description = data?.weather?.[0]?.description ?? "—";
  const icon = data?.weather?.[0]?.icon ?? null;

  const cityInfo = document.createElement("h2");
  cityInfo.textContent = `${cityName}, ${countryName}`;

  const tempInfo = document.createElement("p");
  tempInfo.textContent = temp !== null ? `La temperatura es: ${temp}°C` : "Temperatura no disponible";

  const humidityInfo = document.createElement("p");
  humidityInfo.textContent = `La humedad es del ${humidity}%`;

  const descInfo = document.createElement("p");
  descInfo.textContent = `Descripción meteorológica: ${description}`;

  div.appendChild(cityInfo);
  div.appendChild(tempInfo);
  div.appendChild(humidityInfo);

  if (icon) {
    const img = document.createElement("img");
    img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    img.alt = description || "Ícono del clima";
    img.width = 100;
    img.height = 100;
    img.decoding = "async";
    div.appendChild(img);
  }

  div.appendChild(descInfo);
}

function showError(err) {
  const div = document.getElementById("responseData");
  div.innerHTML = "";
  const p = document.createElement("p");
  p.style.color = "crimson";
  p.textContent = `⚠️ Ocurrió un error: ${err.message || err}`;
  div.appendChild(p);
}
