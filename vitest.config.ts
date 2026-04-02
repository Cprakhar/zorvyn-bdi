import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"
import { fileURLToPath } from "node:url"

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./web/src", import.meta.url)),
        },
    },
    test: {
        projects: [
            {
                test: {
                    name: "server",
                    include: ["test/server/**/*.test.ts"],
                    environment: "node",
                    globals: true,
                },
            },
            {
                extends: true,
                test: {
                    name: "web",
                    include: ["test/web/**/*.test.{ts,tsx}"],
                    globals: true,
                    browser: {
                        enabled: true,
                        provider: playwright({
                            launchOptions: {
                                slowMo: 50,
                            },
                            actionTimeout: 5000,
                        }),
                        instances: [
                            { browser: "chromium" },
                        ],
                        headless: true,
                    },
                },
            }
        ]
    }
})