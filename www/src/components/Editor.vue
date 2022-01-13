<template>
  <div id="editor" class="editor-wrapper">
    <div class="wrapper">
      <p>
        Come back soon! I’m still playing around with what I want this to look
        like.
      </p>
    </div>
  </div>
</template>

<style lang="scss">
@use "../../tokens" as *;

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
      font-family: "SF Mono", "Menlo", monospace;
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
      font-family: "SF Mono", "Menlo", monospace;
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
    font-family: "SF Mono", monospace;
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
