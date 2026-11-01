(function () {
  "use strict";

  var data = window.PORTFOLIO;
  var lib = window.PortfolioLib;
  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");

  var errors = lib.validateData(data);
  if (errors.length > 0) {
    console.error("data.js の形式エラー:\n" + errors.join("\n"));
    empty.textContent = "データの形式に誤りがあります。ブラウザのコンソールを確認してください。";
    empty.hidden = false;
    return;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function externalLink(href, className, text) {
    var anchor = el("a", className, text);
    anchor.href = href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    return anchor;
  }

  function renderProfile() {
    var profile = data.profile;
    document.title = profile.name + " | ポートフォリオ";
    document.getElementById("name").textContent = profile.name;
    document.getElementById("tagline").textContent = profile.tagline;

    var avatar = document.getElementById("avatar");
    if (profile.avatar) {
      var image = el("img");
      image.src = profile.avatar;
      image.alt = "";
      avatar.appendChild(image);
    } else {
      avatar.textContent = profile.name.charAt(0);
    }

    var intro = document.getElementById("intro");
    profile.intro.forEach(function (text) {
      intro.appendChild(el("p", "", text));
    });

    var rail = document.getElementById("sns-rail");
    var contact = document.getElementById("contact-links");
    profile.links.forEach(function (link) {
      var railLink = externalLink(link.url, "sns-link", link.icon);
      railLink.setAttribute("aria-label", link.label);
      rail.appendChild(railLink);

      var item = el("li");
      item.appendChild(externalLink(link.url, "pill", link.label + " ›"));
      contact.appendChild(item);
    });
  }

  function renderCard(item) {
    var card = el("li", "card");
    var inner = lib.isLinkable(item) ? externalLink(item.url, "card-inner") : el("div", "card-inner");

    var thumb = el("div", "thumb");
    if (item.thumb) {
      var image = el("img");
      image.src = item.thumb;
      image.alt = "";
      image.loading = "lazy";
      thumb.appendChild(image);
    } else {
      thumb.textContent = item.kind;
    }

    inner.appendChild(thumb);
    inner.appendChild(el("span", "badge", lib.CATEGORIES[item.category] + " / " + item.kind));
    inner.appendChild(el("h3", "", item.title));
    inner.appendChild(el("p", "", item.summary));
    inner.appendChild(el("p", "meta", item.date));
    card.appendChild(inner);
    return card;
  }

  var tabButtons = Array.prototype.slice.call(document.querySelectorAll(".tab"));

  function setTab(tab) {
    tabButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-tab") === tab));
    });
    var items = lib.filterItems(lib.sortItems(data.items), tab);
    grid.textContent = "";
    items.forEach(function (item) {
      grid.appendChild(renderCard(item));
    });
    empty.hidden = items.length > 0;
  }

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setTab(button.getAttribute("data-tab"));
    });
  });

  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".menu-toggle");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", function () {
    setMenu(!nav.classList.contains("is-open"));
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setMenu(false);
  });

  Array.prototype.forEach.call(nav.querySelectorAll("a"), function (anchor) {
    anchor.addEventListener("click", function () {
      var tab = anchor.getAttribute("data-tab");
      if (tab) setTab(tab);
      setMenu(false);
    });
  });

  renderProfile();
  setTab("all");
})();
