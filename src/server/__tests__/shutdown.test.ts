/**
 * A deploy stops the old server with SIGTERM. A review takes one to two
 * minutes, so stopping at once cut off every review in progress. This proves
 * the server finishes a request it has already started before it exits, and
 * takes no new ones meanwhile.
 */
import type { AddressInfo } from "node:net";
import { request } from "node:http";
import { describe, expect, it, vi } from "vitest";

describe("shutting down", () => {
  it("finishes a request already in progress, refuses new connections, then exits", async () => {
    vi.resetModules();
    const { server, shutdown } = await import("../server.js");
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as AddressInfo).port;

    // A request whose body is still arriving: the server is mid-way through it.
    let reply = "";
    const finished = new Promise<number>((resolve) => {
      const req = request({ port, host: "127.0.0.1", method: "POST", path: "/api/evaluate", headers: { "content-type": "application/json" } }, (res) => {
        res.on("data", (c) => (reply += c));
        res.on("end", () => resolve(res.statusCode ?? 0));
      });
      req.write('{"draft": "part of');
      setTimeout(() => req.end(' a body that never parses'), 150);
    });
    await new Promise((r) => setTimeout(r, 50));

    const exit = vi.fn();
    shutdown("SIGTERM", exit);
    expect(exit).not.toHaveBeenCalled();

    // The request in progress still gets its answer.
    expect(await finished).toBe(400);
    expect(reply).toContain("bad_request");

    // And then the server stops on its own.
    await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(0), { timeout: 3000 });

    // New connections are refused once it has stopped listening.
    await expect(fetch(`http://127.0.0.1:${port}/api/config`)).rejects.toThrow();
  });
});
