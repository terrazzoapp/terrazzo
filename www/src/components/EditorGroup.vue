<script>
const hexRE = /^#[A-F0-9]{3,6}$/i;
const rgbRE = /^rgb(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*)/;
const rgbaRE = /^rgba(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0(\.\d+)?|1))/;

export default {
  props: {
    deleteGroup: Function,
    id: String,
    idMap: Object,
    update: Function,
  },
  methods: {
    isColor(value) {
      if (hexRE.test(value)) return true;
      if (rgbRE.test(value)) return true;
      if (rgbaRE.test(value)) return true;
      return false;
    },
  },
  computed: {
    newFields() {
      const fields = [
        { disabled: true, cb: (newVal) => {} },
        {
          label: 'ID',
          cb: (localID) => {
            document.activeElement.blur();
            this.update('createToken', { id: this.id, localID });
          },
        },
        {
          label: 'Default',
          cb: (newVal) => {
            console.log({ newVal });
          },
        },
      ];
      if (this.node.modes && this.node.modes.length) {
        for (const mode of this.node.modes) {
          fields.push({ label: `mode:${mode}`, cb: () => {} });
        }
      }
      return fields;
    },
    node() {
      return this.idMap[this.id];
    },
    tokenLabels() {
      const labels = ['Subgroup', 'ID', 'Default'];
      if (this.node.modes && this.node.modes.length) {
        for (const mode of this.node.modes) {
          labels.push(`mode:${mode}`);
        }
      }
      return labels;
    },
    tokenValues() {
      const values = [];
      for (const [k, v] of Object.entries(this.idMap)) {
        if (!k.startsWith(this.id)) continue;
        if (v.$type === 'group') continue;
        const parts = k.split('.');
        const localID = parts.pop();

        // group
        values.push({
          value: parts.slice(1).join('.'),
          cb: (newVal) => {
            this.update('moveTokenGroup', { id: k, localID, val: newVal });
          },
        });

        // id
        values.push({
          value: localID,
          cb: (newVal) => {
            this.update('renameLocalID', { id: k, val: newVal });
          },
        });

        // default
        values.push({
          value: v.value.default,
          cb: (newVal) => {
            this.update('updateValue', { id: k, key: 'default', val: newVal });
          },
        });

        // modes
        if (this.node.modes && this.node.modes.length) {
          for (const mode of this.node.modes) {
            values.push({
              value: v.value[mode],
              cb: (newVal) => {
                this.update('updateValue', { id: k, key: mode, val: newVal });
              },
            });
          }
        }
      }
      return values;
    },
  },
};
</script>

<template>
  <div class="editor-group">
    <div class="editor-group-settings">
      <label class="editor-field editor-field__group">
        <span class="editor-field-label">ID</span>
        <input class="editor-field-input" type="text" :value="id" @keyup="(evt) => update('renameGroup', { id, val: evt.target.value })" />
      </label>
      <label class="editor-field editor-field__group">
        <span class="editor-field-label">Modes</span>
        <input
          class="editor-field-input"
          type="text"
          :value="(node.modes || []).join(', ')"
          @keyup="(evt) => update('updateModes', { id, val: evt.target.value })"
        />
      </label>
      <button type="button" class="editor-group-delete" @click="() => deleteGroup(id)">✕</button>
    </div>
    <div class="editor-tokens" :style="`grid-template-columns: repeat(${3 + (node.modes ? node.modes.length : 0)}, auto)`">
      <span v-for="label of tokenLabels" class="editor-token-col">{{ label }}</span>
      <label v-for="{ cb, value } of tokenValues" class="editor-field editor-field__token">
        <div v-if="isColor(value)" class="editor-token-color" :style="`background-color:${value}`"></div>
        <input
          :class="`editor-field-input editor-token-value${isColor(value) ? ' has-color' : ''}`"
          type="text"
          @keyup="(evt) => cb(evt.target.value)"
          :value="value"
        />
      </label>
      <label v-for="{ label, cb, disabled } of newFields" class="editor-field editor-field__token">
        <input class="editor-field-input editor-token-value" :placeholder="label" :disabled="disabled" type="text" @keyup="(evt) => cb(evt.target.value)" />
      </label>
    </div>
  </div>
</template>
