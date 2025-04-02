<template>
    <input :type="type" :placeholder="placeholder" :class="['input-form', classInput]" :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)" />
</template>

<script>
export default {
    name: 'Input',
    props: {
        type: {
            type: String,
            required: true,
            default: 'text'
        },
        placeholder: {
            type: String,
            required: true
        },
        classInput: {
            type: String,
            required: false,
            default: '',
        },
        modelValue: {
            type: [String, Number],
            required: true
        }
    }
}
</script>