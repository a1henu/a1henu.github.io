document.addEventListener("DOMContentLoaded", function() {
    const teasers = document.querySelectorAll(".publication-teaser img");

    if (teasers.length === 0) {
        return;
    }

    const overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("aria-hidden", "true");

    const fullImage = document.createElement("img");
    overlay.appendChild(fullImage);
    document.body.appendChild(overlay);

    function openLightbox(source) {
        fullImage.src = source.currentSrc || source.src;
        fullImage.alt = source.alt;
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
    }

    function closeLightbox() {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");
    }

    teasers.forEach(function(teaser) {
        teaser.addEventListener("click", function() {
            openLightbox(teaser);
        });
    });

    overlay.addEventListener("click", closeLightbox);

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            closeLightbox();
        }
    });
});
