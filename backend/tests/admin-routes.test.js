import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { once } from "node:events";
import http from "node:http";
import jwt from "jsonwebtoken";
import adminRoutes from "../src/routes/admin.routes.js";
import { env } from "../src/config/env.js";
import { db } from "../src/config/db.js";

async function createTestServer() {
  const app = express();
  app.use(express.json());
  app.use("/api/admin", adminRoutes);

  const server = app.listen(0);
  await once(server, "listening");
  const { port } = server.address();

  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

function request(url, { method = "GET", headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method,
      headers: {
        Connection: "close",
        ...headers,
      },
    }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });

    req.on("error", reject);
    req.end();
  });
}

test("admin endpoints reject non-admin JWTs", async () => {
  const { server, baseUrl } = await createTestServer();
  const token = jwt.sign(
    { id: 123, email: "user@example.com", role: "user" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const endpoints = [
    `${baseUrl}/api/admin/profiles`,
    `${baseUrl}/api/admin/profiles/stats`,
    `${baseUrl}/api/admin/profiles/1`,
  ];

  try {
    for (const url of endpoints) {
      const response = await request(url, {
        method: url.endsWith("/1") ? "DELETE" : "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.equal(response.status, 403, url);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await db.end();
  }
});
