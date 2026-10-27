# Diagram and Flowchart Standard: Excalidraw

All flowcharts, system architecture diagrams, state machines, workflow sequences, and visual diagrams in this repository must be created with **Excalidraw**.

## Guidelines

1. **Primary Tool**:
   - Use the installed `excalidraw-skill` or Excalidraw MCP tools (`excalidraw/*`).
   - If driving through CLI: `npx -y mcp-excalidraw-server <command>`.
2. **Artifact Persistence**:
   - Save diagrams as `.excalidraw` files into the `docs/` directory or alongside relevant feature documentation (e.g., `docs/diagrams/<name>.excalidraw`).
   - For Obsidian vaults or markdown documentation embedding, use `.excalidraw.md` or export to SVG/PNG when needed.
3. **Live Canvas**:
   - The Excalidraw live canvas server runs at `http://127.0.0.1:3000`.
   - Use `describe` to verify element placement and text legibility, and maintain clean spacing between nodes.
