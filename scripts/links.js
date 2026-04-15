document.addEventListener("DOMContentLoaded", function () {
    const listElement = document.getElementById("friends-list");
    const emptyElement = document.getElementById("friends-empty");

    if (!listElement || !emptyElement) {
        return;
    }

    if (window.location.protocol === "file:") {
        emptyElement.textContent = "本地直接打开 HTML 时无法读取 JSON；请用本地服务器或 GitHub Pages 预览。";
        emptyElement.hidden = false;
        return;
    }

    fetch("data/links.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Failed to load links data.");
            }

            return response.json();
        })
        .then(function (friends) {
            if (!Array.isArray(friends) || friends.length === 0) {
                emptyElement.hidden = false;
                return;
            }

            const fragment = document.createDocumentFragment();

            friends.forEach(function (friend) {
                if (!friend.name || !friend.link) {
                    return;
                }

                const card = document.createElement("article");
                card.className = "friend-card";

                const cardLink = document.createElement("a");
                cardLink.className = "friend-card-link";
                cardLink.href = friend.link;
                cardLink.target = "_blank";
                cardLink.rel = "noopener noreferrer";
                cardLink.setAttribute("aria-label", "Visit " + friend.name);

                const content = document.createElement("div");
                content.className = "friend-content";

                const name = document.createElement("h3");
                name.className = "friend-name";
                name.textContent = friend.name;

                content.appendChild(name);

                if (friend.desc) {
                    const desc = document.createElement("p");
                    desc.className = "friend-desc";
                    desc.textContent = friend.desc;
                    content.appendChild(desc);
                }

                if (friend.avatar) {
                    const avatar = document.createElement("img");
                    avatar.className = "friend-avatar";
                    avatar.src = friend.avatar;
                    avatar.alt = friend.name + " avatar";
                    avatar.loading = "lazy";
                    cardLink.appendChild(avatar);
                }

                cardLink.appendChild(content);
                card.appendChild(cardLink);
                fragment.appendChild(card);
            });

            if (!fragment.childNodes.length) {
                emptyElement.hidden = false;
                return;
            }

            listElement.appendChild(fragment);
        })
        .catch(function (error) {
            console.error("Error loading links:", error);
            emptyElement.textContent = "友链加载失败。";
            emptyElement.hidden = false;
        });
});
