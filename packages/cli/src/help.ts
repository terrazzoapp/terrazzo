/** Show help */
export function helpCmd() {
  console.log(`tz
  [commands]
    build           Build token artifacts from tokens.json
      --watch, -w   Watch tokens.json for changes and recompile
      --no-lint     Disable linters running on build
    check [path]    Check tokens.json for errors and run linters
    lint [path]     (alias of check)
    init            Create a starter tokens.json file
    lab             Manage your tokens with a web interface

  [options]
    --help          Show this message
    --config, -c    Path to config (default: ./terrazzo.config.js)
    --quiet         Suppress warnings
`);
}
