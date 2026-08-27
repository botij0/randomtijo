<img width="1146" height="250" alt="image" src="https://github.com/user-attachments/assets/f8d55d99-cca5-4667-9748-9230851d5bcc" />


Fair, theatrical table-side picker. Enter 2–12 options, choose roulette, slots, horse race, claw machine, or elimination, then spin. The winner is picked once, then the animation plays toward that result.

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
