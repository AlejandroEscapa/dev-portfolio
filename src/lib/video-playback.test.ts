import { describe, it, expect } from "vitest";
import { safePlay, shouldPlayVideo } from "./video-playback";

describe("shouldPlayVideo", () => {
  it("en modo sección solo depende del viewport", () => {
    expect(shouldPlayVideo({ sectionVisible: true, isActive: false })).toBe(true);
    expect(shouldPlayVideo({ sectionVisible: false, isActive: true })).toBe(false);
  });

  it("en modo tarjeta activa exige ambas condiciones", () => {
    expect(
      shouldPlayVideo({ sectionVisible: true, isActive: false, gateIsActiveOnly: true }),
    ).toBe(false);
    expect(
      shouldPlayVideo({ sectionVisible: true, isActive: true, gateIsActiveOnly: true }),
    ).toBe(true);
    expect(
      shouldPlayVideo({ sectionVisible: false, isActive: true, gateIsActiveOnly: true }),
    ).toBe(false);
  });
});

describe("safePlay", () => {
  it("no lanza cuando play() no devuelve promesa (jsdom)", () => {
    const video = { play: () => undefined } as unknown as HTMLVideoElement;
    expect(() => safePlay(video)).not.toThrow();
  });

  it("traga el rechazo de un autoplay bloqueado", async () => {
    const video = {
      play: () => Promise.reject(new Error("blocked")),
    } as unknown as HTMLVideoElement;
    expect(() => safePlay(video)).not.toThrow();
    await Promise.resolve();
  });

  it("en el caso normal delega en play()", () => {
    let called = 0;
    const video = {
      play: () => {
        called++;
        return Promise.resolve();
      },
    } as unknown as HTMLVideoElement;
    safePlay(video);
    expect(called).toBe(1);
  });
});
