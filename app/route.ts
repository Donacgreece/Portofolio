import portfolio from "./portfolio.html?raw";

export const dynamic = "force-static";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const socialMetadata = `
  <link rel="canonical" href="${origin}/">
  <link rel="alternate" hreflang="en" href="${origin}/">
  <link rel="alternate" hreflang="el" href="${origin}/gr">
  <link rel="alternate" hreflang="x-default" href="${origin}/">
  <meta property="og:image" content="${origin}/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${origin}/og.png">`;
  const document = portfolio.replace("</head>", `${socialMetadata}\n</head>`);

  return new Response(document, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
}
