/* Highlights the nav link for whichever section is currently in view. */
document.addEventListener("DOMContentLoaded", function () {
    const links = Array.prototype.filter.call(
        document.querySelectorAll(".topbar-nav a"),
        function (link) {
            return link.getAttribute("href").charAt(0) === "#";
        }
    );

    if (links.length === 0 || !("IntersectionObserver" in window)) {
        return;
    }

    const byId = new Map();

    links.forEach(function (link) {
        const target = document.getElementById(link.getAttribute("href").slice(1));

        if (target) {
            byId.set(target, link);
        }
    });

    if (byId.size === 0) {
        return;
    }

    const visible = new Set();

    function refresh() {
        let best = null;

        byId.forEach(function (link, section) {
            if (visible.has(section) &&
                (best === null || section.offsetTop < best.offsetTop)) {
                best = section;
            }
        });

        links.forEach(function (link) {
            link.classList.remove("is-active");
        });

        if (best) {
            byId.get(best).classList.add("is-active");
        }
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                visible.add(entry.target);
            } else {
                visible.delete(entry.target);
            }
        });

        refresh();
    }, {
        // Ignore the strip hidden behind the sticky bar, and only count a
        // section once it has a real presence in the viewport.
        rootMargin: "-60px 0px -55% 0px",
        threshold: 0
    });

    byId.forEach(function (link, section) {
        observer.observe(section);
    });
});
