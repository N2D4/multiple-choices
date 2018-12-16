// We're not running Webpack/another bundler! Use the fallback instead (if present)

const fallbackLocation = document.currentScript.getAttribute("fallback");
const fallbackType = document.currentScript.getAttribute("fallback-type");

if (fallbackLocation) {
    const fallback = document.createElement("script");
    fallback.setAttribute("src", fallbackLocation);
    fallback.setAttribute("type", fallbackType || "application/javascript");
    document.head.appendChild(fallback);
}
