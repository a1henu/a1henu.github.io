/* Theme toggle. The initial theme is resolved by the inline script in <head>
   (before first paint) — this only handles clicks and system changes. */
document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("theme-toggle");

    if (!button) {
        return;
    }

    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function stored() {
        try {
            return localStorage.getItem("theme");
        } catch (e) {
            return null;
        }
    }

    function apply(theme) {
        root.setAttribute("data-theme", theme);
        button.setAttribute("aria-label",
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }

    apply(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

    button.addEventListener("click", function () {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";

        try {
            localStorage.setItem("theme", next);
        } catch (e) { /* private mode — the choice just won't persist */ }

        apply(next);
    });

    // Follow the OS while the visitor has no explicit preference of their own.
    media.addEventListener("change", function (event) {
        if (!stored()) {
            apply(event.matches ? "dark" : "light");
        }
    });
});
