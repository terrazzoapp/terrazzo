---
"@terrazzo/cli": patch
---

Apply `--unpublished` to Figma Style import. Styles are now read from the file as they currently are, including local renames and deletions. Unpublished Styles no longer carry the published `created_at`/`updated_at`.
