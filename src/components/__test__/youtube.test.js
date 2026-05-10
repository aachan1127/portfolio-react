import { describe, test, expect } from "vitest";
import { getYoutubeVideoId, getYoutubeEmbedUrl } from "../utils/youtube";

describe("getYoutubeVideoId", () => {
  test("通常のYouTube URLからvideoIdを取得できる", () => {
    const url = "https://www.youtube.com/watch?v=abc123";

    expect(getYoutubeVideoId(url)).toBe("abc123");
  });

  test("Shorts URLからvideoIdを取得できる", () => {
    const url = "https://www.youtube.com/shorts/xyz789";

    expect(getYoutubeVideoId(url)).toBe("xyz789");
  });

  test("YouTube以外のURLはnullを返す", () => {
    const url = "https://example.com";

    expect(getYoutubeVideoId(url)).toBe(null);
  });

  test("空文字はnullを返す", () => {
    expect(getYoutubeVideoId("")).toBe(null);
  });

  test("embed URLを生成できる", () => {
    const url = "https://www.youtube.com/watch?v=abc123";

    expect(getYoutubeEmbedUrl(url)).toBe(
      "https://www.youtube.com/embed/abc123",
    );
  });
});
