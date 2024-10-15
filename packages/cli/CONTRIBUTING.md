# Contributing to @terrazzo/cli

This document contains developer notes and context for @terrazzo/parser. For general contribution guidelines, see [CONTRIBUTING.md](../../CONTRIBUTING.md) in the root.

## What this package does

- Runs @terrazzo/parser and saves the output to disk using Node.js
- Provide watcher scripts that also do this

## What this package DOES NOT do

- Parse/validate/normalize tokens.json (that’s for @terrazzo/parser)
- Interact with plugins
