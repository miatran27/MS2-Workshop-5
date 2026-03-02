(function () {
  'use strict';

  function init() {
    var mapEl = document.getElementById('map');
    if (!mapEl) return;
    if (typeof L === 'undefined') {
      mapEl.innerHTML = '<p style="padding:20px;font-family:system-ui;color:#333;">Map failed to load (Leaflet not found). Use a local server: run <code>python3 -m http.server 8000</code> in this folder, then open <a href="http://localhost:8000">http://localhost:8000</a>.</p>';
      return;
    }

  var HOTSPOTS = [
    {
      id: 'bedstuy',
      name: 'Bedford-Stuyvesant (Bed-Stuy), Brooklyn',
      coords: [40.6862, -73.9415],
      description: 'A historic neighborhood in northern Brooklyn.',
      audioSrc: './audio/bedstuy.mp3'
    },
    {
      id: 'west-village',
      name: 'West Village, Manhattan',
      coords: [40.7358, -74.0036],
      description: 'Charming streets and brownstones in downtown Manhattan.',
      audioSrc: './audio/west-village.mp3'
    },
    {
      id: 'union-square',
      name: 'Union Square, Manhattan',
      coords: [40.7353, -73.9904],
      description: 'Hub for transit, parks, and events.',
      audioSrc: './audio/union-square.mp3'
    },
    {
      id: 'central-park',
      name: 'Central Park, Manhattan',
      coords: [40.7829, -73.9654],
      description: 'Iconic urban park in the heart of Manhattan.',
      audioSrc: './audio/central-park.mp3'
    }
  ];

  var map = L.map('map', {
    center: [40.73, -73.97],
    zoom: 12,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  function createMarkerIcon() {
    var div = document.createElement('div');
    div.className = 'hotspot-marker';
    div.innerHTML = '<span class="pulse-ring"></span><span class="pin-dot"></span>';
    return L.divIcon({
      html: div,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  function buildPopupContent(hotspot) {
    var missingMsg = 'Audio not found — add the file to /audio';
    var audioSection = '<div id="audio-wrap-' + hotspot.id + '" class="popup-audio-wrap">' +
      '<audio controls preload="metadata" src="' + escapeHtml(hotspot.audioSrc) + '" ' +
      'onerror="this.parentElement.innerHTML=\'<p class=\\'popup-audio-missing\\'>' + escapeHtml(missingMsg) + '</p>\'"></audio>' +
      '</div>';

    return '<div class="popup-title">' + escapeHtml(hotspot.name) + '</div>' +
      '<p class="popup-desc">' + escapeHtml(hotspot.description) + '</p>' +
      audioSection;
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  var bounds = L.latLngBounds();
  var openPopup = null;

  HOTSPOTS.forEach(function (hotspot) {
    var marker = L.marker(hotspot.coords, {
      icon: createMarkerIcon()
    }).addTo(map);

    bounds.extend(hotspot.coords);

    marker.bindPopup(buildPopupContent(hotspot), {
      maxWidth: 320,
      className: 'hotspot-popup'
    });
    marker.on('popupclose', function () {
      if (openPopup === marker) openPopup = null;
    });
    marker.on('click', function () {
      if (openPopup) openPopup.closePopup();
      openPopup = marker;
      marker.openPopup();
    });
  });

  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (openPopup && openPopup.getPopup()) {
        openPopup.closePopup();
        openPopup = null;
      }
    }
  });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
