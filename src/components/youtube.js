export const getYoutubeVideoId = (url) => {
  if (!url) return null;

  if (url.includes("youtube.com/watch?v=")) {
    return url.split("v=")[1]?.split("&")[0];
  }

  if (url.includes("youtube.com/shorts/")) {
    return url.split("shorts/")[1]?.split("?")[0];
  }

  return null;
};
