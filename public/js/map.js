mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
	container: "map",
	style: "mapbox://styles/mapbox/streets-v12",
	center: listing.geometry.coordinates,
	zoom: 12,
});

const markerEl = document.createElement("div");
markerEl.className = "price-marker";
markerEl.textContent = `$${listing.price}`;

const popupHTML = `
	<div class="popup-card">
		<img src="${listing.image.url}" alt="Listing Image">
		<div class="popup-content">
			<h4 style="text-align: center;">${listing.location}, ${listing.country}</h4>
			<p style="text-align: center;">Exact location provided after booking</p>
		</div>
	</div>
`;

const popup = new mapboxgl.Popup({
	offset: 25,
	className: "listing-popup",
}).setHTML(popupHTML);

new mapboxgl.Marker(markerEl)
	.setLngLat(listing.geometry.coordinates)
	.setPopup(popup)
	.addTo(map);
