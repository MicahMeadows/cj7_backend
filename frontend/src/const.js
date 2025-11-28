export default class Constants {
    static MAP_ID = "90f87356969d889c"
    static ZOOM = 18
    static TILE_SIZE = 256;
    static TILE_QUERY_THRESHOLD = 600;
    static TILE_ZOOM = .5;
    static RENDER_DEBUG_CANVAS = true;

    static getManeuverName(value) {
        const key = Object.entries(this.MANEUVER).find(([k, v]) => v === value)?.[0] || "UNKNOWN";
        
        // Convert to "Title Case"
        return key
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    

    static MANEUVER = {
        UNKNOWN: 0,
        DEPART: 1,
        DESTINATION: 2,
        DESTINATION_LEFT: 3,
        DESTINATION_RIGHT: 4,
        STRAIGHT: 5,
        TURN_LEFT: 6,
        TURN_RIGHT: 7,
        TURN_KEEP_LEFT: 8,
        TURN_KEEP_RIGHT: 9,
        TURN_SLIGHT_LEFT: 10,
        TURN_SLIGHT_RIGHT: 11,
        TURN_SHARP_LEFT: 12,
        TURN_SHARP_RIGHT: 13,
        TURN_U_TURN_CLOCKWISE: 14,
        TURN_U_TURN_COUNTERCLOCKWISE: 15,
        MERGE_UNSPECIFIED: 16,
        MERGE_LEFT: 17,
        MERGE_RIGHT: 18,
        FORK_LEFT: 19,
        FORK_RIGHT: 20,
        ON_RAMP_UNSPECIFIED: 21,
        ON_RAMP_LEFT: 22,
        ON_RAMP_RIGHT: 23,
        ON_RAMP_KEEP_LEFT: 24,
        ON_RAMP_KEEP_RIGHT: 25,
        ON_RAMP_SLIGHT_LEFT: 26,
        ON_RAMP_SLIGHT_RIGHT: 27,
        ON_RAMP_SHARP_LEFT: 28,
        ON_RAMP_SHARP_RIGHT: 29,
        ON_RAMP_U_TURN_CLOCKWISE: 30,
        ON_RAMP_U_TURN_COUNTERCLOCKWISE: 31,
        OFF_RAMP_UNSPECIFIED: 32,
        OFF_RAMP_LEFT: 33,
        OFF_RAMP_RIGHT: 34,
        OFF_RAMP_KEEP_LEFT: 35,
        OFF_RAMP_KEEP_RIGHT: 36,
        OFF_RAMP_SLIGHT_LEFT: 37,
        OFF_RAMP_SLIGHT_RIGHT: 38,
        OFF_RAMP_SHARP_LEFT: 39,
        OFF_RAMP_SHARP_RIGHT: 40,
        OFF_RAMP_U_TURN_CLOCKWISE: 41,
        OFF_RAMP_U_TURN_COUNTERCLOCKWISE: 42,
        ROUNDABOUT_CLOCKWISE: 43,
        ROUNDABOUT_COUNTERCLOCKWISE: 44,
        ROUNDABOUT_STRAIGHT_CLOCKWISE: 45,
        ROUNDABOUT_STRAIGHT_COUNTERCLOCKWISE: 46,
        ROUNDABOUT_LEFT_CLOCKWISE: 47,
        ROUNDABOUT_LEFT_COUNTERCLOCKWISE: 48,
        ROUNDABOUT_RIGHT_CLOCKWISE: 49,
        ROUNDABOUT_RIGHT_COUNTERCLOCKWISE: 50,
        ROUNDABOUT_SLIGHT_LEFT_CLOCKWISE: 51,
        ROUNDABOUT_SLIGHT_LEFT_COUNTERCLOCKWISE: 52,
        ROUNDABOUT_SLIGHT_RIGHT_CLOCKWISE: 53,
        ROUNDABOUT_SLIGHT_RIGHT_COUNTERCLOCKWISE: 54,
        ROUNDABOUT_SHARP_LEFT_CLOCKWISE: 55,
        ROUNDABOUT_SHARP_LEFT_COUNTERCLOCKWISE: 56,
        ROUNDABOUT_SHARP_RIGHT_CLOCKWISE: 57,
        ROUNDABOUT_SHARP_RIGHT_COUNTERCLOCKWISE: 58,
        ROUNDABOUT_U_TURN_CLOCKWISE: 59,
        ROUNDABOUT_U_TURN_COUNTERCLOCKWISE: 60,
        ROUNDABOUT_EXIT_CLOCKWISE: 61,
        ROUNDABOUT_EXIT_COUNTERCLOCKWISE: 62,
        FERRY_BOAT: 63,
        FERRY_TRAIN: 64,
        NAME_CHANGE: 65
    };
      
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