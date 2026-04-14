/// <reference types="node" />
const { defineConfig, env } = require("prisma/config");
const dotenv = require("dotenv");
const path = require("path");

// Explicitly load the .env file from the current directory
dotenv.config({ path: path.join(__dirname, ".env") });

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // We use DIRECT_URL here so migrations hit the DB directly (Port 5432)
    url: env("DIRECT_URL"),
  },
});