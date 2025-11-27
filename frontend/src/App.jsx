import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

let DefaultIcon = L.icon({ 
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function App() {
    const mapRef = useRef(null); 
    const markersRef = useRef({}); 
    const socketRef = useRef(null); 

    useEffect(() => {
        // Initialize Socket
        socketRef.current = io("https://real-time-tracker-3.onrender.com");

        // Initialize Map
        if (!mapRef.current) {
            mapRef.current = L.map('map').setView([0, 0], 20);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; PrakashSoni"
            }).addTo(mapRef.current);
        }

        const socket = socketRef.current;
        const map = mapRef.current;
        const markers = markersRef.current;

        console.log("Socket.io loaded");

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    socket.emit("send-location", { latitude, longitude }); // Send location to server
                    if (mapRef.current) {
                        mapRef.current.setView([latitude, longitude]);
                    }
                },
                (err) => {
                    console.error(err);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                }
            );
        }

        socket.on("receive-location", (data) => {
            const { id, latitude, longitude } = data;
            // map.setView([latitude, longitude]); // Removed to prevent jitter
            if (markers[id]) {
                markers[id].setLatLng([latitude, longitude]);
            } else {
                markers[id] = L.marker([latitude, longitude]).addTo(map);
            }
        });

        socket.on("user-disconnected", (id) => {
            if (markers[id]) {
                map.removeLayer(markers[id]);
                delete markers[id];
            }
        });

        return () => {
            socket.disconnect();
            // Clean up map if needed, though usually fine to leave for single page app
        };
    }, []);

    return (
        <div id="map" className="w-full h-full"></div>
    );
}

export default App;
