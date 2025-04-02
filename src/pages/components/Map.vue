<template>
    <div class="relative w-full h-96 border border-gray-300 rounded-2xl overflow-hidden">
        <div id="map" class="w-full h-full"></div>
    </div>
</template>

<script setup>
import { onMounted, ref, nextTick, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Props recibidos para el tipo de problema
const props = defineProps({
    selectedProblem: {
        type: String,
        required: true,
    },
    lat: {
        type: String,
        default: '19.432608', // Valor por defecto si lat no se pasa
    },
    lng: {
        type: String,
        default: '-99.133209', // Valor por defecto si lng no se pasa
    }
});

const emit = defineEmits();

const map = ref(null);
const marker = ref(null);
const mexicoPolygon = ref(null);

// Función para determinar si la ubicación está dentro de México
const isInsideMexico = (lat, lng) => {
    if (!mexicoPolygon.value) return false;

    for (let layer of mexicoPolygon.value.getLayers()) {
        if (layer instanceof L.Polygon || layer instanceof L.MultiPolygon) {
            if (layer.getBounds().contains(L.latLng(lat, lng))) {
                return true;
            }
        }
    }
    return false;
};

// Función para obtener el color del marcador según el tipo de problema
const getMarkerColor = (problemType) => {
    let color;
    switch (problemType) {
        case 'Falta de agua':
            color = 'grey'; // Gris
            break;
        case 'Solicitud de pipa':
            color = 'red'; // Rojo
            break;
        case 'Fuga de agua':
            color = 'green'; // Verde
            break;
        case 'Agua contaminada':
            color = 'yellow'; // Amarillo
            break;
        case 'Falta tapa en caja de válvula':
            color = 'black'; // Negro
            break;
        case 'Desbordamiento de aguas negras':
            color = 'orange'; // Naranja
            break;
        case 'Coladera sin tapa':
            color = 'violet'; // Púrpura
            break;
        case 'Socavón / Hundimiento':
            color = 'brown'; // Marrón
            break;
        case 'Inundación / Encharcamiento':
            color = 'fuchsia'; // Fucsia (Magenta)
            break;
        case 'Drenaje tapado / coladera / Tubería':
            color = 'silver'; // Plata (Gris claro)
            break;
        case 'Tomas Clandestinas':
            color = 'blue'; // Azul
            break;
        default:
            color = 'gray'; // Gris por defecto
            break;
    }
    return color;
};

// Función para actualizar el marcador con el color según la problemática
const updateMarkerColor = (problemType) => {
    const markerColor = getMarkerColor(problemType); // Obtener el color del marcador

    const iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="30" height="30">
            <path fill="${markerColor}" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
        </svg>
    `;

    if (marker.value) {
        marker.value.setIcon(L.divIcon({
            className: "fa-marker",
            html: iconHtml, // Actualiza el SVG con el color dinámico
            iconSize: [30, 30], // Tamaño del icono
            iconAnchor: [15, 30], // Ancla del icono
        }));
    }
};

// Función para mover el mapa a la nueva ubicación
const moveMapToLocation = (lat, lng) => {
    lat = parseFloat(lat);
    lng = parseFloat(lng);

    // Si las coordenadas no son válidas, usar las coordenadas por defecto
    if (isNaN(lat) || isNaN(lng)) {
        console.error("Las coordenadas proporcionadas no son válidas:", lat, lng);
        return;
    }

    // Si las coordenadas no están dentro de México, moverlas al centro de México
    if (!isInsideMexico(lat, lng)) {
        [lat, lng] = [19.432608, -99.133209];  // Coordenadas por defecto de México
        console.warn("La ubicación debe estar dentro de México. Se ha movido al centro de México.");
    }

    // Actualizar solo si las coordenadas son diferentes
    if (!marker.value || marker.value.getLatLng().lat !== lat || marker.value.getLatLng().lng !== lng) {
        marker.value.setLatLng([lat, lng]);
        map.value.setView([lat, lng], 12);
    }

    emit("update-latlng", { lat: lat.toFixed(6), lng: lng.toFixed(6) });
};

defineExpose({
    moveMapToLocation,
    updateMarkerColor
});

onMounted(async () => {
    await nextTick();

    map.value = L.map("map", {
        zoomControl: false,
        maxBoundsViscosity: 1.0,
    }).setView([19.432608, -99.133209], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map.value);

    fetch("/src/assets/geoJson/mexico.geojson")
        .then(response => response.json())
        .then(data => {
            mexicoPolygon.value = L.geoJSON(data, {
                style: {
                    border: 1,
                    weight: 2,
                    fillOpacity: 0.1
                }
            }).addTo(map.value);

            map.value.fitBounds(mexicoPolygon.value.getBounds());
        })
        .catch(error => console.error("Error cargando el GeoJSON:", error));

    // Crear el marcador inicial (por defecto, al centro de México)
    marker.value = L.marker([19.432608, -99.133209], {
        icon: L.divIcon({
            className: "fa-marker",
            html: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="30" height="30">
                    <path fill="gray" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                </svg>
            `, // El icono SVG con color gris por defecto
            iconSize: [30, 30], // Tamaño del icono
            iconAnchor: [15, 30], // Ancla del icono
        })
    }).addTo(map.value);

    marker.value.on("dragend", (e) => {
        let { lat, lng } = e.target.getLatLng();
        if (!isInsideMexico(lat, lng)) {
            [lat, lng] = [19.432608, -99.133209];
        }
        marker.value.setLatLng([lat, lng]);
        emit("update-latlng", { lat: lat.toFixed(6), lng: lng.toFixed(6) });
    });

    map.value.on("click", (e) => {
        let { lat, lng } = e.latlng;
        if (!isInsideMexico(lat, lng)) {
            [lat, lng] = [19.432608, -99.133209];
        }
        marker.value.setLatLng([lat, lng]);
        emit("update-latlng", { lat: lat.toFixed(6), lng: lng.toFixed(6) });
    });
});

// Watcher para actualizar la ubicación del marcador
watch(() => props.selectedProblem, (newProblemType) => {
    updateMarkerColor(newProblemType); // Cambiar solo el color cuando se actualice la problemática
});
</script>
