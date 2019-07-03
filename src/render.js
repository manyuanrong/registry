const fetch = require("node-fetch");

const response = require("./response");

module.exports = async function render(request, pathname, { url, repo }) {
  if (url.endsWith("/") || url.endsWith("/index.html")) {
    return require("./render_dir")(pathname, { url, repo });
  }

  const res = await fetch(url);
  if (res.status !== 200) return response.notFound();

  // TODO(ry) use res.arrayBuffer() instead of res.text().
  const content = await res.text();

  // If big response, redirect instead of doing something fancy.
  // This has been a problem with
  //    /std/prettier/vendor/parser_typescript.js
  // See https://github.com/denoland/registry/issues/115
  if (content.length > 1024 * 1024) {
    return response.redirect(url);
  }

  if (
    request.headers.accept &&
    request.headers.accept.some(header => header.value.includes("text/html"))
  ) {
    // Accept header present, this is a web browser, so display something
    // pretty.
    if (pathname.endsWith(".md")) {
      return require("./render_markdown")(pathname, content, repo);
    }

    return require("./render_code")(pathname, content, repo);
  } else {
    // If we're not displaying HTML, proxy the body instead of redirecting.
    const lambdaRes = await fetch2LambdaResponse(res, content);
    // console.log("lambdaRes", lambdaRes);
    return lambdaRes;
  }
};

const blacklistedHeaders = [
  // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-requirements-limits.html#lambda-blacklisted-headers
  "Connection",
  "Expect",
  "Keep-alive",
  "Proxy-Authenticate",
  "Proxy-Authorization",
  "Proxy-Connection",
  "Trailer",
  "Upgrade",
  "X-Accel-Buffering",
  "X-Accel-Charset",
  "X-Accel-Limit-Rate",
  "X-Accel-Redirect",
  "X-Amz-Cf-*",
  "X-Amzn-*",
  "X-Cache",
  "X-Edge-*",
  "X-Forwarded-Proto",
  "X-Real-IP",
  // Read only headers
  "Content-Length",
  "Host",
  "Transfer-Encoding",
  "Via",
  // Read-only Headers for CloudFront Origin Request Events
  "Accept-Encoding",
  "If-Modified-Since",
  "If-None-Match",
  "If-Range",
  "If-Unmodified-Since",
  "Range",
  // Others
  "x-github-request-id",
  "x-fastly-request-id",
  "x-geo-block-list",
  "x-served-by",
  // TODO(ry) We shouldn't need to filter Content-Encoding
  // but because we do fetchResponse.text() instead of arrayBuffer()
  // we need to remove any encoding. See:
  // https://github.com/denoland/deno_install/issues/65
  "Content-Encoding"
].map(n => n.toLowerCase());

function isBlacklistedHeader(name) {
  return blacklistedHeaders.indexOf(name.toLowerCase()) >= 0;
}

async function fetch2LambdaResponse(res, body) {
  if (res.status === 404) return response.notFound();
  const headers = {};
  res.headers.forEach(function(value, name) {
    if (!isBlacklistedHeader(name)) {
      headers[name] = [{ key: name, value }];
    }
  });
  return {
    status: res.status,
    body,
    headers
  };
}
