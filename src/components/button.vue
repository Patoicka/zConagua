<template>
    <button :type="type" :class="['btn-primary', classButton]">
        {{ text }}
        <fa-icon v-if="icon" :icon="['fas', icon]" :class="['ml-3', classIcon]" />
    </button>
</template>

<script>
export default {
    name: 'Button',
    props: {
        type: {
            type: String,
            required: true,
            default: 'button'
        },
        text: {
            type: String,
            required: true
        },
        icon: {
            type: [String, Array],
            required: false,
        },
        classIcon: {
            type: String,
            required: false,
            default: '',
        },
        classButton: {
            type: String,
            required: false,
            default: '',
        }
    }
}
</script>
