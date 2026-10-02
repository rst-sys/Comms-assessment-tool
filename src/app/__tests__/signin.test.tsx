// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SignIn } from "../SignIn.js";

function stubLogin(respond: () => Response) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (url.endsWith("/api/login")) return respond();
    return new Response("{}", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const field = () => screen.getByLabelText("Password") as HTMLInputElement;
const button = () => screen.getByRole("button", { name: /Continue|Checking/ }) as HTMLButtonElement;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("the password screen", () => {
  it("shows the new copy, with the cursor already in the field", () => {
    stubLogin(() => new Response("{}", { status: 200 }));
    render(<SignIn onDone={() => {}} />);
    expect(screen.getByRole("heading", { name: "Tester access" })).toBeTruthy();
    expect(screen.getByText("This prototype is open to a small group of testers. Enter the password you were given.")).toBeTruthy();
    expect(
      screen.getByText(
        /Everyone testing shares this password\. It isn’t an account\. The app keeps only a sign-in cookie in your browser and a daily count of reviews, cleared each day\. Please ask before passing it on\./,
      ),
    ).toBeTruthy();
    expect(document.activeElement).toBe(field());
    // Never greyed out for an empty field.
    expect(button().disabled).toBe(false);
  });

  it("is a real password field with a proper label", () => {
    stubLogin(() => new Response("{}", { status: 200 }));
    render(<SignIn onDone={() => {}} />);
    expect(field().type).toBe("password");
    expect(field().getAttribute("autocomplete")).toBe("current-password");
    expect(field().id).toBe("password-input");
    expect(document.querySelector('label[for="password-input"]')?.textContent).toBe("Password");
  });

  it("signs in on the right password, submitted with the Enter key", async () => {
    const fetchMock = stubLogin(() => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const onDone = vi.fn();
    render(<SignIn onDone={onDone} />);
    fireEvent.change(field(), { target: { value: "correct horse" } });
    fireEvent.submit(field().form!);
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("on a wrong password: shows the error, marks the field, keeps the text and refocuses it", async () => {
    stubLogin(() => new Response(JSON.stringify({ error: "unauthorized", message: "That password is not right." }), { status: 401 }));
    const onDone = vi.fn();
    render(<SignIn onDone={onDone} />);
    fireEvent.change(field(), { target: { value: "nearly right" } });
    fireEvent.click(button());
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("That password didn’t work. Check it and try again.");
    expect(field().getAttribute("aria-invalid")).toBe("true");
    expect(field().getAttribute("aria-describedby")).toBe(alert.id);
    expect(field().value).toBe("nearly right");
    expect(document.activeElement).toBe(field());
    expect(onDone).not.toHaveBeenCalled();

    // Typing again clears the error and the error state.
    fireEvent.change(field(), { target: { value: "nearly right!" } });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(field().getAttribute("aria-invalid")).toBeNull();
    expect(field().getAttribute("aria-describedby")).toBeNull();
  });

  it("keeps the server's own message for anything that isn't a wrong password", async () => {
    stubLogin(() => new Response(JSON.stringify({ error: "rate_limited", message: "Too many attempts. Wait a minute." }), { status: 429 }));
    render(<SignIn onDone={() => {}} />);
    fireEvent.change(field(), { target: { value: "anything" } });
    fireEvent.click(button());
    expect((await screen.findByRole("alert")).textContent).toBe("Too many attempts. Wait a minute.");
  });

  it("on an empty submit: says what's missing and sends nothing", () => {
    const fetchMock = stubLogin(() => new Response("{}", { status: 200 }));
    render(<SignIn onDone={() => {}} />);
    fireEvent.click(button());
    expect(screen.getByRole("alert").textContent).toBe("Enter the password to continue.");
    expect(field().getAttribute("aria-invalid")).toBe("true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows 'Checking…' and can't be pressed twice while it waits", async () => {
    let release: (r: Response) => void = () => {};
    const fetchMock = stubLogin(() => undefined as never);
    fetchMock.mockImplementation(() => new Promise<Response>((r) => { release = r; }));
    render(<SignIn onDone={() => {}} />);
    fireEvent.change(field(), { target: { value: "pw" } });
    fireEvent.click(button());
    expect(button().textContent).toBe("Checking…");
    expect(button().disabled).toBe(true);
    fireEvent.submit(field().form!);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    release(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  });

  it("Show and Hide switch the field between hidden and visible, and say which is on", () => {
    stubLogin(() => new Response("{}", { status: 200 }));
    render(<SignIn onDone={() => {}} />);
    const toggle = screen.getByRole("button", { name: "Show" });
    expect(toggle.getAttribute("type")).toBe("button");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    fireEvent.change(field(), { target: { value: "secret" } });
    fireEvent.click(toggle);
    expect(field().type).toBe("text");
    expect(screen.getByRole("button", { name: "Hide" }).getAttribute("aria-pressed")).toBe("true");
    expect(field().value).toBe("secret");
    fireEvent.click(screen.getByRole("button", { name: "Hide" }));
    expect(field().type).toBe("password");
  });
});
