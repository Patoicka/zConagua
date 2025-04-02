<template>
    <select :class="['input-form', classSelect]" v-model="selectedValue">
        <option class="bg-gray-800/20 text-black" disabled value="">{{ placeholder }}</option>
        <option class="bg-gray-800/20 text-black" v-for="(option, index) in options" :key="index" :value="option">{{ option }}
        </option>
    </select>
</template>

<script>
export default {
    name: 'Select',
    props: {
        options: {
            type: Array,
            required: true
        },
        placeholder: {
            type: String,
            required: true
        },
        classSelect: {
            type: String,
            default: ''
        },
        modelValue: {
            type: [String, Number],
            required: true
        }
    },
    computed: {
        selectedValue: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit('update:modelValue', value);
            }
        }
    }
}
</script>
