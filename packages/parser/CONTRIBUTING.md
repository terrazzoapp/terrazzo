# Contributing to @terrazzo/parser

This document contains developer notes and context for @terrazzo/parser. For general contribution guidelines, see [CONTRIBUTING.md](../../CONTRIBUTING.md) in the root.

## What this package does

- Parses, validates, and normalizes tokens.json
- Executes plugins and builds output
- Executes linting

## What this package DOES NOT do

- Write files to disk (that’s a job for Node.js; this can be run in a browser)
