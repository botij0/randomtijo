<img width="1146" height="250" alt="image" src="https://github.com/user-attachments/assets/f8d55d99-cca5-4667-9748-9230851d5bcc" />

---

Fair arcade picker for a group at the table. Type `2–12` options, choose a mode, and spin!

## Description

One winner is chosen up front with equal chance; the theater then plays toward that result and never re-rolls.

1. Enter options (at least two, at most twelve).
2. Choose roulette, slots, horse race, claw machine, or elimination.
3. Spin. The winner is already chosen; what you see is the reveal.

Runs in the browser with no accounts or server. Options and last mode stay in local storage.

## Deploy with Docker

```bash
docker compose up --build -d
```

Open [http://localhost:8080](http://localhost:8080). Stop with `docker compose down`.

Without Compose:

```bash
docker build -t randomtijo .
docker run --rm -p 8080:80 randomtijo
```

## Develop locally

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Test

```bash
bun run test
```

## Build

```bash
bun run build
```
