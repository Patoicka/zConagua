<template>
    <div class="relative w-full h-96 border border-gray-300 rounded-2xl overflow-hidden">
        <div id="map" class="w-full h-full"></div>
    </div>
</template>

<script setup>
import { onMounted, ref, nextTick, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const props = defineProps({
    selectedProblem: {
        type: String,
        required: true,
    },
    lat: {
        type: String,
        default: '19.432608', 
    },
    lng: {
        type: String,
        default: '-99.133209',
    }
});

const emit = defineEmits();

const map = ref(null);
const marker = ref(null);
const mexicoPolygon = ref(null);

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

const getMarkerColor = (problemType) => {
    let color;
    switch (problemType) {
        case 'Falta de agua':
            color = 'grey'; 
            break;
        case 'Solicitud de pipa':
            color = 'red'; 
            break;
        case 'Fuga de agua':
            color = 'green'; 
            break;
        case 'Agua contaminada':
            color = 'yellow'; 
            break;
        case 'Falta tapa en caja de válvula':
            color = 'black';
            break;
        case 'Desbordamiento de aguas negras':
            color = 'orange'; 
            break;
        case 'Coladera sin tapa':
            color = 'violet';
            break;
        case 'Socavón / Hundimiento':
            color = 'brown'; 
            break;
        case 'Inundación / Encharcamiento':
            color = 'fuchsia'; 
            break;
        case 'Drenaje tapado / coladera / Tubería':
            color = 'silver'; 
            break;
        case 'Tomas Clandestinas':
            color = 'blue';
            break;
        default:
            color = 'gray'; 
            break;
    }
    return color;
};

const updateMarkerColor = (problemType) => {
    const markerColor = getMarkerColor(problemType);

    const iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="30" height="30">
            <path fill="${markerColor}" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
        </svg>
    `;

    if (marker.value) {
        marker.value.setIcon(L.divIcon({
            className: "fa-marker",
            html: iconHtml,
            iconSize: [30, 30], 
            iconAnchor: [15, 30], 
        }));
    }
};

const moveMapToLocation = (lat, lng) => {
    lat = parseFloat(lat);
    lng = parseFloat(lng);

    if (isNaN(lat) || isNaN(lng)) {
        console.error("Las coordenadas proporcionadas no son válidas:", lat, lng);
        return;
    }
    
    if (!isInsideMexico(lat, lng)) {
        [lat, lng] = [19.432608, -99.133209]; 
        console.warn("La ubicación debe estar dentro de México. Se ha movido al centro de México.");
    }

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

            const bounds = mexicoPolygon.value.getBounds();
            map.value.fitBounds(bounds); 

            map.value.setMaxBounds(bounds);
        })
        .catch(error => console.error("Error cargando el GeoJSON:", error));

    marker.value = L.marker([19.432608, -99.133209], {
        icon: L.divIcon({
            className: "fa-marker",
            html: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="30" height="30">
                    <path fill="gray" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                </svg>
            `, 
            iconSize: [30, 30], 
            iconAnchor: [15, 30], 
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

watch(() => props.selectedProblem, (newProblemType) => {
    updateMarkerColor(newProblemType);
});
</script>
