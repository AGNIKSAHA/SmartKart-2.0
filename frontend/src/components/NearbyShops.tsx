import { useState, useEffect } from "react";
import { useNearbyShops } from "../features/shops/shopHooks";
import { Loader } from "./Loader";
import { MapPin, Navigation, Info } from "lucide-react";

export const NearbyShops = () => {
  const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(
    null,
  );
  const [radius, setRadius] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
        });
      },
      (err) => {
        let msg = "Please enable location access to find nearby shops";
        if (err.code === 2) {
          msg =
            "Your location is currently unavailable. This happens sometimes on office networks or internal Mac settings.";
        } else if (err.code === 3) {
          msg = "Location request timed out.";
        }
        setError(msg);
        console.error("Geolocation error:", err);
      },
      {
        enableHighAccuracy: false, // Less strict for better success rate on desktops
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const useDemoLocation = () => {
    setCoords({ lng: -74.006, lat: 40.7128 }); // New York
    setError(null);
  };

  const { data: shops, isLoading } = useNearbyShops(
    coords?.lng,
    coords?.lat,
    radius,
  );

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex gap-3 text-amber-800">
          <Info className="h-5 w-5 shrink-0" />
          <div className="space-y-3">
            <p className="text-sm font-medium">{error}</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchLocation}
                className="rounded-lg bg-amber-200 px-4 py-1.5 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-300"
              >
                Try Again
              </button>
              <button
                onClick={useDemoLocation}
                className="rounded-lg border border-amber-300 px-4 py-1.5 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100"
              >
                Use Demo Location (NYC)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!coords) return <Loader label="Detecting location..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Navigation className="h-5 w-5 text-brand-600" />
          Shops Near You
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">Radius:</label>
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <Loader label="Finding shops..." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {shops?.map((shop) => (
            <div
              key={shop.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-brand-300 hover:"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-brand-700">
                    {shop.shopkeeperProfile?.companyName || "Local Shop"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {shop.shopkeeperProfile?.companyAddress}
                  </p>
                </div>
                <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                  {shop.distanceKm.toFixed(1)} km
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-xs text-slate-500">Open for orders</span>
              </div>
            </div>
          ))}
          {shops?.length === 0 && (
            <p className="col-span-full py-8 text-center text-slate-500 italic">
              No shops found within {radius}km of your location.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
