const ignorePatterns = ["/node_modules/"];

module.exports = {
  preset: "ts-jest/presets/js-with-babel",
  testEnvironment: "node",
  testPathIgnorePatterns: ignorePatterns,
  coveragePathIgnorePatterns: ignorePatterns,
  coverageThreshold: {
    global: {
      lines: 95,
    },
  },
  // setupFiles: ['./tests/setEnvVars.js'],
  // setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ["./tests/setup.ts"],
};
