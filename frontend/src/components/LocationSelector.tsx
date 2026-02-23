import { useCallback, useState, useRef } from "react";
import { GoogleMap, MarkerF, Autocomplete } from "@react-google-maps/api";
import { Loader } from "./Loader";
import { CreditCard, MapPin, X, Check, Search } from "lucide-react";
import { useGoogleMaps } from "../providers/GoogleMapsProvider";

interface LocationSelectorProps {
  initialLocation?: { lng: number; lat: number } | undefined;
  onLocationSelect: (location: { lng: number; lat: number }) => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "450px",
  borderRadius: "1.25rem",
};

const mapOptions: google.maps.MapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControl: true,
  styles: [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#e9e9e9" }],
    },
  ],
};

const defaultCenter = {
  lat: 28.7526,
  lng: 77.4985,
};

export const LocationSelector = ({
  initialLocation,
  onLocationSelect,
}: LocationSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null,
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    initialLocation || defaultCenter,
  );

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setMarker(newPos);
      setMapCenter(newPos);
      mapRef.current?.panTo(newPos);
    }
  }, []);

  const onAutocompleteLoad = (ref: google.maps.places.Autocomplete) => {
    autocompleteRef.current = ref;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      const location = place?.geometry?.location;

      if (location) {
        const newPos = {
          lat: location.lat(),
          lng: location.lng(),
        };
        setMarker(newPos);
        setMapCenter(newPos);
        mapRef.current?.panTo(newPos);
      }
    }
  };

  const handleConfirm = () => {
    onLocationSelect(marker || mapCenter);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-brand-100 hover:bg-slate-50 active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900">
              {marker ? "Location Selected" : "Select Location"}
            </p>
            <p className="text-xs text-slate-500">
              {marker
                ? `${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}`
                : "Click to search or pick on map"}
            </p>
          </div>
        </div>
        <div className="h-2 w-2 rounded-full bg-brand-500" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-brand-50 p-2 text-brand-500 font-bold">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Pick Location
                  </h3>
                  <p className="text-xs text-slate-500">
                    Search address or drop a pin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content / Map Area */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {isLoaded && !loadError && (
                <div className="relative">
                  <Autocomplete
                    onLoad={onAutocompleteLoad}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search for an area, building or street..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none ring-brand-500/20 transition-all focus:border-brand-500 focus:bg-white focus:ring-4"
                      />
                    </div>
                  </Autocomplete>
                </div>
              )}

              {!isLoaded && !loadError && (
                <div className="flex h-[450px] items-center justify-center rounded-2xl bg-slate-50">
                  <Loader label="Opening Map Navigator..." />
                </div>
              )}

              {loadError && (
                <div className="flex h-[450px] flex-col items-center justify-center rounded-2xl bg-red-50 p-8 text-center text-red-800">
                  <CreditCard className="mb-4 h-12 w-12 text-red-400" />
                  <h4 className="text-lg font-bold">Satellite Link Failed</h4>
                  <p className="mt-2 text-sm opacity-80 text-center max-w-xs">
                    Please ensure Billing is enabled on Google Cloud and Places
                    API is active.
                  </p>
                  <button
                    onClick={() => {
                      setMarker(defaultCenter);
                      setMapCenter(defaultCenter);
                    }}
                    className="mt-6 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-100 transition-all hover:bg-brand-700"
                  >
                    Use Fallback: KIET Campus
                  </button>
                </div>
              )}

              {isLoaded && !loadError && (
                <div className="relative rounded-2xl border border-slate-100 shadow-sm overflow-hidden ring-1 ring-slate-100">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                    onLoad={onMapLoad}
                    onClick={onMapClick}
                    options={mapOptions}
                  >
                    {marker && <MarkerF position={marker} />}
                  </GoogleMap>

                  {!marker && (
                    <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none">
                      <div className="rounded-full bg-slate-900/90 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-md shadow-xl">
                        Tap any point on the map to drop pin
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between bg-white p-5 px-6 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                {marker ? (
                  <span className="flex items-center gap-1.5 font-bold text-brand-500">
                    <Check className="h-4 w-4" /> Position locked
                  </span>
                ) : (
                  "Choose a location to continue"
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-3 text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-brand-100"
                >
                  Confirm Choice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
