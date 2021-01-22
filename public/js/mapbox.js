/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidGhlb3V0Y2FzdCIsImEiOiJja2p3NGd5dW0wZXp4Mm9sNzJyaGZvbmdrIn0.Loi74Zb4snsV9ZBK5kLaaw';
  var map = new mapboxgl.Map({
    container: 'map',
    // style: 'mapbox://styles/theoutcast/ckjyidx8n2qza17puqyumt6dk',
    style: 'mapbox://styles/theoutcast/ckjykceo621z217mv5mp67pus',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 100, left: 100, right: 100 },
  });
};
