# BitForge

A browser-based numeric workbench for TriCore reverse engineering. Integer calculations use BigInt for exact 8/16/32/64-bit conversion. Supports binary, octal, decimal, hexadecimal, signed two’s complement, IEEE 754 input/reinterpretation, byte arrays, endianness, bit editing, logical/arithmetic shifts, rotation, byte swapping, configurable fixed point, field extraction and TriCore `movh.a` + `lea` address splitting.

## Run

Node.js 20.19+ or 22.12+ is required (verified with Node 24).

```sh
npm ci
npm run dev -- --port 5173
```

## Validate

```sh
npm test
npm run build
```

Values and session history stay in browser memory. No backend or API credentials are needed. Google Fonts are requested for typography; system fallbacks are provided. History clears on reload. Out-of-range integer input is rejected; bit operations wrap to the selected word size. Changing to a smaller word size truncates upper bits. Byte-array input must contain exactly one selected word. Fixed point uses Qm.n with the sign bit included in m.

This is a numeric workbench, not a TriCore disassembler. Instruction behavior should be checked against the target architecture manual.
