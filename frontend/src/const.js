export default class Constants {
    static ZOOM = 18
    static TILE_SIZE = 256;
    static TILE_QUERY_THRESHOLD = 600;
    static TILE_ZOOM = .5;
    static RENDER_DEBUG_CANVAS = true;
    static mapStyles = [
        // Background land
        {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#000000" }] // black background for everything
        },
        // Roads
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#00ff00" }] // neon green roads
        },
        // Road labels (green text with black outline)
        {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#00ff00" }]
        },
        {
            featureType: "road",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#000000" }, { weight: 2 }]
        },
        // Water
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#000000" }]
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#00ff00" }]
        },
        {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#000000" }]
        },
        // Points of Interest (POIs)
        {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#000000" }]
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#00ff00" }]
        },
        {
            featureType: "poi",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#000000" }]
        },
        // Transit stations
        {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#000000" }]
        },
        {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#00ff00" }]
        },
        {
            featureType: "transit.station",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#000000" }]
        },
        // Administrative labels
        {
            featureType: "administrative",
            elementType: "labels.text.fill",
            stylers: [{ color: "#00ff00" }]
        },
        {
            featureType: "administrative",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#000000" }]
        },
        // Building/house outlines
        {
            featureType: "landscape.man_made",
            elementType: "geometry.stroke",
            stylers: [{ color: "#00ff00" }] // bright green outlines
        }
        ];

}