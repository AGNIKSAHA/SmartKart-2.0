import { useCallback, useState, useRef } from "react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
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
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
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
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-brand-500 hover:bg-slate-50 active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900">
              {marker ? "Delivery Pin Set" : "Select Location"}
            </p>
            <p className="text-xs text-slate-400">
              {marker
                ? `${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}`
                : "Tap to set destination"}
            </p>
          </div>
        </div>
        <Search className="h-4 w-4 text-slate-300" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative z-[5001] flex flex-col w-full max-w-2xl bg-white sm:rounded-3xl animate-in zoom-in-95 duration-300 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-brand-50 p-2 text-brand-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Pin Location
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Search or tap the map
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Robust Search Box */}
              {isLoaded && !loadError && (
                <div className="relative w-full z-10">
                  {/* Search icon */}
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-20 text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  {/* Google PlaceAutocomplete mounts here */}
                  <div
                    className="w-full"
                    ref={(el) => {
                      if (el && el.children.length === 0) {
                        el.innerHTML = "";
                        const autocomplete =
                          new google.maps.places.PlaceAutocompleteElement({});
                        autocomplete.classList.add("gmp-search-box");
                        autocomplete.setAttribute("id", "location-search-box");
                        autocomplete.setAttribute("name", "locationSearch");
                        autocomplete.addEventListener(
                          "gmp-placeselect",
                          async ({ place }: any) => {
                            if (place) {
                              await place.fetchFields({
                                fields: ["geometry", "location"],
                              });
                              const location = place.location;
                              if (location) {
                                const newPos = {
                                  lat: location.lat(),
                                  lng: location.lng(),
                                };
                                setMarker(newPos);
                                setMapCenter(newPos);
                                mapRef.current?.panTo(newPos);
                                mapRef.current?.setZoom(17);
                              }
                            }
                          },
                        );
                        el.appendChild(autocomplete);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Map Body */}
            <div className="relative bg-slate-50" style={{ height: "450px" }}>
              {isLoaded && !loadError ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "450px" }}
                  center={mapCenter}
                  zoom={15}
                  onLoad={onMapLoad}
                  onClick={onMapClick}
                  options={mapOptions}
                >
                  {marker && <MarkerF position={marker} />}
                </GoogleMap>
              ) : (
                <div className="flex h-full items-center justify-center">
                  {loadError ? (
                    <div className="text-center p-8">
                      <CreditCard className="mx-auto h-12 w-12 text-red-200 mb-4" />
                      <p className="text-sm font-bold text-slate-800">
                        Map System Offline
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Please verify API key & Billing
                      </p>
                    </div>
                  ) : (
                    <Loader label="Connecting to Satellites..." />
                  )}
                </div>
              )}

              {!marker && isLoaded && !loadError && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                  <div className="bg-slate-900/90 text-white text-[11px] font-bold px-4 py-2 rounded-full backdrop-blur-sm">
                    Tap the map to Drop delivery pin
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Position Status
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {marker ? (
                      <span className="text-brand-600">Location Locked</span>
                    ) : (
                      <span className="text-slate-400">Not Picked</span>
                    )}
                  </p>
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!marker}
                    className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Confirm Choice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
