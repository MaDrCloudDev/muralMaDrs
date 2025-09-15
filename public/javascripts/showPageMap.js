mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: "map",
	style: "mapbox://styles/mapbox/dark-v10", // dark theme stylesheet
	center: mural.geometry.coordinates, // starting position [lng, lat]
	zoom: 10, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
	.setLngLat(mural.geometry.coordinates)
	.setPopup(
		new mapboxgl.Popup({ offset: 25 }).setHTML(
			`<h3>${mural.title}</h3><p>${mural.location}</p>`
		)
	)
	.addTo(map);
