var map = L.map('map').setView([-6.2088, 106.8456], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function getColor(warna) {
  return warna == "Merah" ? '#ff0000' :
         warna == "Hijau" ? '#00ff00' :
         warna == "Biru" ? '#0000ff' :
         warna == "Orange" ? '#f28821' :
         warna == "Toska" ? '#21f2d3' :
         '#808080';
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.warna),
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.5
  };
}

function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.nama) {
    layer.bindPopup(feature.properties.nama);
  }
}

fetch('rel.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: 'Blue', 
        weight: 3, 
        opacity: 1 
      }
    }).addTo(map);
  })
  .catch(error => console.error('Error fetching the GeoJSON file:', error));

fetch('jakarta.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);
  })
  .catch(error => console.error('Error fetching the GeoJSON file:', error));


function pointToLayer(feature, latlng) {
  if (feature.geometry.type === "Point") {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: 'icon.jpg',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      })
    });
  }
}

fetch('stasiun.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: onEachFeature,
      pointToLayer: pointToLayer,
    }).addTo(map);
    showStationList(data);
  })
  .catch(error => console.error('Error fetching the GeoJSON file:', error));

var stationGeojson;

fetch('stasiun.geojson')
  .then(response => response.json())
  .then(data => {
    stationGeojson = data;
  })
  .catch(error => console.error('Error fetching the GeoJSON file:', error));

function searchStation() {
  var searchTerm = document.getElementById('search-input').value.toLowerCase();

  var found = false;
  if (stationGeojson.features && stationGeojson.features.length > 0) {
    stationGeojson.features.forEach(feature => {
      if (feature.properties && feature.properties.nama) {
        var stationName = feature.properties.nama.toLowerCase();
        if (stationName.includes(searchTerm)) {
          var coordinates = feature.geometry.coordinates;
          map.setView([coordinates[1], coordinates[0]], 13);
          L.popup()
            .setLatLng([coordinates[1], coordinates[0]])
            .setContent(feature.properties.nama)
            .openOn(map);
          found = true;
        }
      }
    });
  }
  if (!found) {
    alert('Stasiun tidak ditemukan.');
  }
}

function showStationList(data) {
  var stationNames = data.features.map(feature => feature.properties.nama);
  var stationListHTML = '<ul>';
  stationNames.forEach(name => {
    stationListHTML += `<li><a href="#" class="station-link" data-name="${name}">${name}</a></li>`;
  });
  stationListHTML += '</ul>';
  document.getElementById('station-list').innerHTML = stationListHTML;
  var stationLinks = document.getElementsByClassName('station-link');
  Array.from(stationLinks).forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      var stationName = this.getAttribute('data-name');
      zoomToStation(stationName);
    });
  });
}

function zoomToStation(stationName) {
  var stationFeature = stationGeojson.features.find(feature => feature.properties.nama === stationName);

  if (stationFeature) {
    var coordinates = stationFeature.geometry.coordinates;
    map.setView([coordinates[1], coordinates[0]], 15, { animate: true, duration: 1 });
  }
}


