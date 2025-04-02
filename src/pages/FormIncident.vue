<template>
    <div class="flex flex-col items-center justify-center w-full h-full px-8 py-4">
        <h1 class="text-3xl font-bold text-gray-50 py-4">Formulario Incidentes</h1>

        <Map ref="mapComponent" :selectedProblem="selectedProblem" @update-latlng="updateLatLng" />

        <div class="flex w-full items-center">
            <Input v-model="searchLocation" type="text" placeholder="Buscar dirección o lugar" />
            <Button @click="searchLocationOnMap" text="Buscar" classButton="bg-cyan-600 p-2 rounded-md ml-2" />
        </div>

        <div class="flex flex-col w-full">
            <div class="flex w-full h-full items-center">
                <span class="text-red-500 font-bold text-sm pr-2">*</span>
                <Input v-model="municipality" type="text" placeholder="Ingrese el municipio" />
            </div>
            <div class="flex w-full h-full items-center">
                <span class="text-red-500 font-bold text-sm pr-2">*</span>
                <Input v-model="lat" type="text" placeholder="Ingresar Latitud" />
            </div>
            <div class="flex w-full h-full items-center">
                <span class="text-red-500 font-bold text-sm pr-2">*</span>
                <Input v-model="lng" type="text" placeholder="Ingresar Longitud" />
            </div>
        </div>

        <div class="flex flex-col w-full items-center">
            <h1 class="text-white text-2xl font-bold mb-2 mt-2">Seleccione la problemática</h1>
            <div class="flex w-full h-full items-center">
                <span class="text-red-500 font-bold text-sm pr-2">*</span>
                <Select classSelect="" :options="options" v-model="selectedProblem"
                    placeholder="Seleccionar una problemática" />
            </div>
        </div>

        <span v-if="errorMessage" class="text-red-500 font-semibold text-sm mb-4">Verificar los campos requeridos</span>

        <Button @click="handleSubmit" text="Enviar" class="bg-gray-200 p-2 rounded-lg mt-4" icon="paper-plane" />
    </div>
</template>

<script setup>
import { ref } from "vue";
import Map from "./components/Map.vue";
import Input from "../components/input.vue";
import Button from "../components/button.vue";
import Select from "../components/select.vue";

const searchLocation = ref("");
const lat = ref("");
const lng = ref("");
const selectedProblem = ref("");
const municipality = ref("");
const errorMessage = ref(false);

const options = [
    'Falta de agua',
    'Solicitud de pipa',
    'Fuga de agua',
    'Agua contaminada',
    'Falta tapa en caja de válvula',
    'Desbordamiento de aguas negras',
    'Coladera sin tapa',
    'Socavón / Hundimiento',
    'Inundación / Encharcamiento',
    'Drenaje tapado / coladera / Tubería',
    'Tomas Clandestinas'
];

const mapComponent = ref(null);

const updateLatLng = (data) => {
    lat.value = data.lat;
    lng.value = data.lng;
};

const searchLocationOnMap = async () => {
    if (!searchLocation.value) return;

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchLocation.value}&countrycodes=MX`
    );
    const results = await response.json();
    if (results.length > 0) {
        const { lat: newLat, lon: newLon } = results[0];

        lat.value = newLat;
        lng.value = newLon;

        if (mapComponent.value) {
            mapComponent.value.moveMapToLocation(newLat, newLon, selectedProblem.value);
        }

        // Llenar el municipio automáticamente
        await fetchMunicipality(newLat, newLon);
    }
};

const fetchMunicipality = async (latitude, longitude) => {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
    );
    const data = await response.json();

    if (data.address && data.address.city) {
        municipality.value = data.address.city;
    } else if (data.address && data.address.town) {
        municipality.value = data.address.town;
    } else if (data.address && data.address.village) {
        municipality.value = data.address.village;
    } else {
        municipality.value = "Desconocido";
    }
};

const handleSubmit = () => {
    if (!lat.value || !lng.value || !municipality.value || !selectedProblem.value) {
        errorMessage.value = true;
    } else {
        const formData = {
            direccion: searchLocation.value,
            latitud: lat.value,
            longitud: lng.value,
            municipio: municipality.value,
            problematica: selectedProblem.value,
        };

        console.log(JSON.stringify(formData, null, 1));
        errorMessage.value = false;
    }
};
</script>
