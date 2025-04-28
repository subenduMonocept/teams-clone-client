npm create vite@latest appName -- --template react-ts

npm i

npm install tailwindcss @tailwindcss/vite

## vite.config.ts

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
plugins: [tailwindcss()],
server: {
port: 3002,
},
});

## index.css

@import "tailwindcss";
