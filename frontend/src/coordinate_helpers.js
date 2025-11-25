const TILE_SIZE = 256;
const PI = Math.PI;

export default class MapUtils {
  // Convert lat/lng to world pixel coordinates at a specific zoom
  static fromLatLngToPoint(lat, lng, zoom) {
    const siny = Math.sin((lat * PI) / 180);
    // Clamp to prevent infinity at poles
    const clampedSiny = Math.min(Math.max(siny, -0.9999), 0.9999);

    const scale = TILE_SIZE * 2 ** zoom;

    const x = ((lng + 180) / 360) * scale;
    const y = ((0.5 - Math.log((1 + clampedSiny) / (1 - clampedSiny)) / (4 * PI)) * scale);

    return { x, y };
  }

  // Convert latitude/longitude to tile coordinates at a given zoom
  static fromLatLngToTileCoord(lat, lng, zoom) {
    const point = MapUtils.fromLatLngToPoint(lat, lng, zoom);
    const x = Math.floor(point.x / TILE_SIZE);
    const y = Math.floor(point.y / TILE_SIZE);
    return { x, y, z: zoom };
  }

  // Convert tile coordinates back to latitude/longitude
  static fromTileCoordToLatLng(x, y, zoom) {
    const n = 2 ** zoom;
    const lng = (x / n) * 360 - 180;
    const latRad = Math.atan(Math.sinh(PI * (1 - (2 * y) / n)));
    const lat = (latRad * 180) / PI;
    return { lat, lng };
  }
}
