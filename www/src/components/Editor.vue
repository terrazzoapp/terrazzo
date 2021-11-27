<script>
import yaml from 'js-yaml';
import Prism from 'prismjs';
import 'prismjs/components/prism-yaml.min.js';
import Group from './EditorGroup.vue';

export default {
  data() {
    return {
      copyLabel: 'Copy',
      yaml: '',
      yamlError: '',
      schema: {
        name: 'My Tokens',
        tokens: {
          color: {
            name: 'Color',
            type: 'group',
            modes: ['light', 'dark'],
            tokens: {
              charcoal: { value: { default: '#36454F', light: '#36454F', dark: '#FFFAFA' } },
              erin: { value: { default: '#00FF40', light: '#00FF40', dark: '#1AB958' } },
              snow: { value: { default: '#FFFAFA', light: '#FFFAFA', dark: '#36454F' } },
              ultramarine: { value: { default: '#120A8F', light: '#120A8F', dark: '#1F29B5' } },
              vermilion: { value: { default: '#E34234', light: '#E34234', dark: '#BB3F34' } },
            },
          },
          type: {
            name: 'Typography',
            type: 'group',
            tokens: {
              family: {
                type: 'group',
                tokens: {
                  founders_grotesk: { value: { default: 'Founders Grotesk' } },
                  founders_mono: { value: { default: 'Founders Mono' } },
                },
              },
            },
          },
        },
      },
    };
  },
  watch: {
    schema(newSchema) {
      this.yamlError = '';
      const newYAML = yaml.dump(newSchema);
      if (this.yaml !== newYAML) this.yaml = newYAML;
    },
    yaml(newYAML, oldYAML) {
      if (newYAML === oldYAML) return;
      try {
        const parsed = yaml.load(newYAML);
        this.yamlError = '';
        this.schema = parsed;
      } catch (err) {
        this.yamlError = String(err);
      }
    },
  },
  created() {
    this.yaml = yaml.dump(this.schema);
  },
  mounted() {
    window.onbeforeunload = () => window.confirm('Leave this page? You will lose all work.');
  },
  methods: {
    deleteGroup(id) {
      if (window.confirm(`Delete group ${id}? This can’t be undone.`)) {
        let schemaTokens = this.schema.tokens;
        delete schemaTokens[id];
        this.schema = { ...this.schema, tokens: schemaTokens };
      }
    },
    copy() {
      navigator.clipboard.writeText(yaml.dump(this.schema));
      this.copyLabel = 'Copied';
      setTimeout(() => {
        this.copyLabel = 'Copy';
      }, 3000);
    },
    newGroup() {
      this.schema = {
        ...this.schema,
        tokens: { ...this.schema.tokens, newGroup: { type: 'group', tokens: {} } },
      };
    },
    flattenTokens(group, id) {
      const tokens = {};
      for (const [k, v] of Object.entries(group.tokens || {})) {
        const fullID = id ? [id, k].join('.') : k;
        if (v.type === 'group') {
          tokens[fullID] = v;
          const subtokens = this.flattenTokens(v, fullID);
          for (const [k2, v2] of Object.entries(subtokens)) {
            tokens[k2] = v2;
          }
        } else {
          tokens[fullID] = v;
        }
      }
      return tokens;
    },
    update(type, data) {
      switch (type) {
        case 'createToken': {
          this.invalidYAML = '';
          const { id, localID } = data;
          let schemaTokens = this.schema.tokens;
          schemaTokens[id].tokens[localID] = {
            value: { default: '' },
          };
          this.schema = { ...this.schema, tokens: schemaTokens };
          break;
        }
        case 'moveTokenGroup': {
          this.invalidYAML = '';
          const { id, localID, val } = data;
          const oldGroups = id.split('.');
          const newGroupID = `${oldGroups[0]}.${val}`;
          const newGroups = newGroupID.split('.');
          if (!newGroupID || id === `${newGroupID}.${localID}`) return;
          const token = this.idMap[id];
          if (newGroups.some((groupID) => !groupID)) return; // don’t create broken groups
          let schemaTokens = this.schema.tokens;

          // add value
          let newGroup = schemaTokens;
          for (const subgroup of newGroups) {
            if (newGroup.tokens) {
              if (newGroup.tokens[subgroup]) {
                newGroup = newGroup.tokens[subgroup];
              } else {
                newGroup.tokens[subgroup] = { type: 'group', tokens: {} };
                newGroup = newGroup.tokens[subgroup];
              }
            } else if (newGroup[subgroup]) {
              newGroup = newGroup[subgroup];
            }
          }
          newGroup.tokens[localID] = JSON.parse(JSON.stringify(token));

          // delete old value
          let oldGroup = schemaTokens;
          oldGroups.pop();
          for (const subgroup of oldGroups) {
            if (oldGroup.tokens?.[subgroup]) {
              oldGroup = oldGroup.tokens[subgroup];
            } else if (oldGroup[subgroup]) {
              oldGroup = oldGroup[subgroup];
            } else {
              break;
            }
          }
          delete oldGroup.tokens[localID];

          this.schema = { ...this.schema, tokens: schemaTokens };
          break;
        }
        case 'renameGroup': {
          this.yamlError = '';
          const { id: oldID, val: newID } = data;
          if (!newID) return;
          const tokens = {};
          // keep ordering
          for (const k of Object.keys(this.schema.tokens)) {
            if (k === oldID) {
              tokens[newID] = this.schema.tokens[k];
            } else {
              tokens[k] = this.schema.tokens[k];
            }
          }
          this.schema = { ...this.schema, tokens };
          break;
        }
        case 'renameLocalID': {
          this.yamlError = '';
          const { id, val: newID } = data;
          if (!newID) return;
          const groups = id.split('.');
          const oldID = groups.pop();
          if (oldID === newID) return;
          let schemaTokens = this.schema.tokens;
          let group = schemaTokens;
          // find group
          for (const subgroup of groups) {
            if (group.tokens?.[subgroup]) {
              group = group.tokens[subgroup];
            } else if (group[subgroup]) {
              group = group[subgroup];
            } else {
              break;
            }
          }
          if (group.tokens[newID]) return; // don’t overwrite
          const newGroupTokens = {};
          // preserve order
          for (const k of Object.keys(group.tokens)) {
            if (k === oldID) {
              newGroupTokens[newID] = group.tokens[k];
            } else {
              newGroupTokens[k] = group.tokens[k];
            }
          }
          group.tokens = newGroupTokens;
          this.schema = { ...this.schema, tokens: schemaTokens }; // create new ref to update
          break;
        }
        case 'updateModes': {
          this.yamlError = '';
          const { id, val: modeStr } = data;
          const modes = modeStr.split(',').map((val) => val.trim());
          const groups = id.split('.');
          let schemaTokens = this.schema.tokens;
          let group = schemaTokens;
          // find group
          for (const subgroup of groups) {
            if (group.tokens?.[subgroup]) {
              group = group.tokens[subgroup];
            } else if (group[subgroup]) {
              group = group[subgroup];
            } else {
              break;
            }
          }
          if (modes.length) {
            group.modes = modes;
          } else {
            delete group.modes;
          }
          this.schema = { ...this.schema, tokens: schemaTokens };
          break;
        }
        case 'updateValue': {
          this.yamlError = '';
          const { id, key, val } = data;
          if (!val) return;
          const parts = id.split('.');
          let schemaTokens = this.schema.tokens;
          let token = schemaTokens;
          // find group
          for (const part of parts) {
            if (token.tokens?.[part]) {
              token = token.tokens[part];
            } else if (token[part]) {
              token = token[part];
            } else {
              break;
            }
          }
          token.value[key] = val;
          this.schema = { ...this.schema, tokens: schemaTokens };
          break;
        }
      }
    },
  },
  computed: {
    idMap() {
      return this.flattenTokens(this.schema);
    },
    highlightedYAML() {
      return Prism.highlight(this.yaml, Prism.languages.yaml, 'yaml');
    },
  },
  components: {
    Group,
  },
};
</script>

<template>
  <div id="editor" class="editor-wrapper">
    <div class="editor">
      <div id="builder" class="editor-gui">
        <fieldset>
          <legend>Schema</legend>
          <input id="schema-name" class="editor-field" type="text" v-model="schema.name" />
        </fieldset>
        <fieldset>
          <legend>Groups</legend>
          <Group v-for="k of Object.keys(schema.tokens)" :id="k" :idMap="idMap" :update="update" :deleteGroup="deleteGroup" />
          <menu class="editor-menu tar">
            <button class="editor-btn" type="button" @click="newGroup">New Group</button>
          </menu>
        </fieldset>
      </div>
      <div id="viewer" class="editor-yaml">
        <h2 class="editor-yaml-title">tokens.yaml</h2>
        <button class="editor-btn editor-yaml-copy" type="button" @click="copy">{{ copyLabel }}</button>
        <div v-if="yamlError" class="editor-yaml-error">{{ yamlError }}</div>
        <textarea class="editor-yaml-code" spellcheck="false" v-model="yaml"></textarea>
        <pre class="editor-yaml-highlighted"><code class="language-yaml" v-html="highlightedYAML"></code></pre>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '../../tokens' as *;

.editor {
  border: 1.5px solid currentColor;
  display: grid;
  grid-template-columns: auto 40rem;

  &-btn {
    background: rgba($color__blue, 0);
    border: 1.5px solid currentColor;
    color: currentColor;
    font-size: inherit;
    padding: 0.5em 0.75em;
    transition: background-color 150ms linear;

    &:focus,
    &:hover {
      background-color: adjust-color($color: $color__blue, $lightness: 10%);
    }
  }

  &-field {
    background: $color__blue;
    display: flex;
    transition: background-color 150ms linear;
    width: 100%;

    &:focus-within,
    &:hover {
      background: adjust-color($color: $color__blue, $lightness: 10%);
    }

    &-label {
      align-items: center;
      display: flex;
      font-size: 10pt;
      height: 2rem;
      padding: 0.5rem 0.75rem;
    }

    &-input {
      height: 2rem;
      flex-grow: 1;
      padding: 0;
    }

    &__token {
      border-bottom: 1px dashed rgba($color__white, 0.3);
      position: relative;
    }

    &__group {
      border-left: 1px solid currentColor;

      .editor-field-label {
        border-right: 1px dashed currentColor;
      }

      .editor-field-input {
        padding-left: 0.625rem;
      }

      &:first-of-type {
        border-left: none;
      }

      &:last-of-type {
        border-right: 1px solid currentColor;
      }
    }
  }

  &-gui {
    border-right: 1.5px solid currentColor;
    position: relative;
  }

  &-group {
    margin-bottom: 1.5rem;

    &-delete {
      align-items: center;
      background: none;
      border: none;
      color: inherit;
      display: flex;
      height: 2rem;
      justify-content: center;
      transition: background-color 150ms linear;
      width: 2rem;

      &:focus,
      &:hover {
        background: adjust-color($color: $color__blue, $lightness: 10%);
      }
    }

    &-settings {
      border: 1px solid currentColor;
      display: grid;
      grid-template-columns: 1fr 2fr min-content;
    }

    &-tokens {
      padding-left: 1rem;
    }
  }

  &-token {
    &-col {
      font-size: 10pt;
      margin: 0.5rem 0;
    }

    &-color {
      border-radius: 50%;
      height: 0.75rem;
      left: 0;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 0.75rem;
    }

    &-value {
      border-bottom: 1px solid $color__white;
      font-size: 9pt;

      &.has-color {
        padding-left: 1rem;
      }
    }
  }

  &-tokens {
    display: grid;
  }

  &-yaml {
    position: relative;

    &::after {
      background-image: linear-gradient($color__blue, rgba($color__blue, 0));
      content: '';
      display: block;
      width: 100%;
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      height: 4rem;
    }

    &-code,
    &-highlighted {
      color: $color__white;
      font-family: 'SF Mono', 'Menlo', monospace;
      font-size: 10pt;
      font-weight: 400;
      line-height: 1.2;
      margin: 0;
      padding: 2.5rem 1.5rem;
    }

    &-code {
      background: transparent;
      border: none;
      height: 100%;
      font-weight: 100;
      left: 0;
      outline: none;
      overflow: hidden;
      position: absolute;
      resize: none;
      top: 0;
      width: 100%;
    }

    &-highlighted {
      pointer-events: none;
      position: relative;
      z-index: 2;

      code {
        font-family: 'SF Mono', 'Menlo', monospace;
      }
    }

    &-copy {
      position: absolute;
      right: 0.75rem;
      top: 0.75em;
      z-index: 5;
    }

    &-error {
      background: $color__red;
      bottom: 0;
      font-family: 'SF Mono', 'Menlo', monospace;
      font-size: 9pt;
      left: 0;
      padding: 0.5rem;
      position: absolute;
      white-space: pre;
      width: 100%;
      z-index: 5;
    }

    &-title {
      font-family: monospace;
      font-size: 9pt;
      left: 1.5rem;
      opacity: 0.5;
      pointer-events: none;
      position: absolute;
      top: 0.5rem;
      z-index: 5;
    }
  }

  &-wrapper {
    margin-left: auto;
    margin-right: auto;
    margin-top: 3rem;
    max-width: 120rem;
    padding-left: 2rem;
    padding-right: 2rem;
    width: 100%;
  }

  fieldset {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    padding-right: 0.75rem;
    padding-left: 8rem;
  }

  fieldset + fieldset {
    border-top: 1px solid currentColor;
  }

  input {
    background: none;
    border: none;
    color: inherit;
    font-family: 'SF Mono', monospace;
    font-weight: 400;
    outline: none;
  }

  legend {
    font-size: 18pt;
    font-weight: 600;
    left: 0.75rem;
    margin: 0 0 0.75rem;
    position: absolute;
  }
}
</style>
