import type { Config } from "jest";
import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

const config: Config = {
    testEnvironment: "node",
    transform: {
        ...tsJestTransformCfg,
    },
    setupFiles: ["<rootDir>/jest.setup.ts"],
};

export default config;