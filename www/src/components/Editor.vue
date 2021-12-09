<script>
import yaml from 'js-yaml';
import { Validator } from '@cobalt-ui/core';

const validator = new Validator();

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
    schema(newSchema, oldSchema) {
      if (JSON.stringify(newSchema) === JSON.stringify(oldSchema)) return;
      this.yamlError = '';
      this.yaml = yaml.dump(newSchema);
    },
    yaml(newYAML, oldYAML) {
      if (newYAML === oldYAML) return;
      try {
        const parsed = yaml.load(newYAML);
        this.yamlError = '';
        this.schema = parsed;
        const { errors, warnings } = validator.validate(newYAML);
        console.log({ errors });
        if (errors) {
          this.yamlError = errors[0];
        }
      } catch (err) {
        this.yamlError = String(err);
      }
    },
  },
  created() {
    this.yaml = yaml.dump(this.schema);
  },
  mounted() {
    // window.onbeforeunload = () => window.confirm('Leave this page? You will lose all work.');
  },
  methods: {
    copy() {
      navigator.clipboard.writeText(yaml.dump(this.schema));
      this.copyLabel = 'Copied';
      setTimeout(() => {
        this.copyLabel = 'Copy';
      }, 3000);
    },
  },
};
</script>

<template>
  <div id="editor" class="editor-wrapper">
    <div class="editor">
      <!--
      <div class="editor-yaml">
        <textarea class="editor-yaml-code" spellcheck="false" v-model="yaml"></textarea>
        <div v-if="yamlError" class="editor-yaml-error">{{ yamlError }}</div>
      </div>
      -->
      <p>Come back soon! I’m still playing around with what I want this to look like.</p>
    </div>
  </div>
</template>

<style lang="scss">
@use '../../tokens' as *;

.editor {
  border: 1.5px solid currentColor;

  &-yaml {
    display: flex;
    min-height: 40rem;
    position: relative;

    &-code {
      background: transparent;
      border: none;
      color: inherit;
      font-family: 'SF Mono', 'Menlo', monospace;
      font-size: 10pt;
      font-weight: 400;
      line-height: 1.2;
      margin: 0;
      outline: none;
      padding: 1.5rem;
      resize: none;
      width: 100%;
    }

    &-copy {
      position: absolute;
      right: 0.75rem;
      top: 0.75em;
      z-index: 5;
    }

    &-error {
      background: $color__Red;
      color: $color__White;
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
