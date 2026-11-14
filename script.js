(function () {
  "use strict";

  var data = window.PORTFOLIO;
  var lib = window.PortfolioLib;
  var grid = document.getElementById("grid");
  var cover = document.getElementById("cover");
  var latestLabel = document.getElementById("latest-label");
  var moreLabel = document.getElementById("more-label");
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

  function renderActivity(activity) {
    var li = el("li", "activity");
    var inner = lib.isLinkable(activity)
      ? externalLink(activity.url, "activity-inner")
      : el("div", "activity-inner");

    var text = el("div", "activity-text");
    text.appendChild(el("strong", "", activity.name));
    text.appendChild(el("span", "", activity.summary));
    inner.appendChild(text);

    if (lib.isLinkable(activity)) {
      var mark = el("span", "activity-mark", "↗");
      mark.setAttribute("aria-hidden", "true");
      inner.appendChild(mark);
    }

    li.appendChild(inner);
    return li;
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

    var skillsSection = document.getElementById("skills");
    if (Array.isArray(profile.skills) && profile.skills.length > 0) {
      var skillGroups = document.getElementById("skill-groups");
      profile.skills.forEach(function (group) {
        var wrap = el("div", "skill-group");
        if (group.group === "やってみたい") wrap.classList.add("is-wish");
        wrap.appendChild(el("h3", "skill-group-title", group.group));
        var list = el("ul", "skill-list");
        group.items.forEach(function (skill) {
          var li = el("li", "skill-chip");
          li.appendChild(el("span", "skill-name", skill.name));
          if (skill.note) li.appendChild(el("small", "skill-note", skill.note));
          list.appendChild(li);
        });
        wrap.appendChild(list);
        skillGroups.appendChild(wrap);
      });
    } else {
      skillsSection.hidden = true;
    }

    var activityList = document.getElementById("activity-list");
    profile.activities.forEach(function (activity) {
      activityList.appendChild(renderActivity(activity));
    });

    document.getElementById("footer-name").textContent = profile.name + " | ポートフォリオ";
    var footerLinks = document.getElementById("footer-links");
    profile.links.forEach(function (link) {
      var footerItem = el("li");
      footerItem.appendChild(externalLink(link.url, "", link.label));
      footerLinks.appendChild(footerItem);
    });

    var rail = document.getElementById("sns-rail");
    profile.links.forEach(function (link) {
      var railLink = externalLink(link.url, "sns-link", link.image ? undefined : link.icon);
      railLink.setAttribute("aria-label", link.label);
      if (link.image) {
        railLink.classList.add("has-image");
        var iconImage = el("img");
        iconImage.src = link.image;
        iconImage.alt = "";
        railLink.appendChild(iconImage);
      }
      rail.appendChild(railLink);
    });
  }

  function renderCard(item, isCover) {
    var card = el(isCover ? "div" : "li", isCover ? "card cover" : "card");
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

    if (Array.isArray(item.extraLinks) && item.extraLinks.length > 0) {
      var extra = el("div", "card-extra");
      item.extraLinks.forEach(function (link) {
        extra.appendChild(externalLink(link.url, "card-extra-link", link.label));
      });
      card.appendChild(extra);
    }
    return card;
  }

  var tabButtons = Array.prototype.slice.call(document.querySelectorAll(".tab"));

  function setTab(tab) {
    tabButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-tab") === tab));
    });
    var items = lib.filterItems(lib.sortItems(data.items), tab);
    cover.textContent = "";
    grid.textContent = "";
    if (items.length > 0) cover.appendChild(renderCard(items[0], true));
    items.slice(1).forEach(function (item) {
      grid.appendChild(renderCard(item, false));
    });
    latestLabel.hidden = items.length === 0;
    moreLabel.hidden = items.length < 2;
    empty.hidden = items.length > 0;
  }

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setTab(button.getAttribute("data-tab"));
    });
  });

  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".menu-toggle");
  var mainArea = document.getElementById("main");
  var heroArea = document.getElementById("top");
  var footerArea = document.querySelector(".footer");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    mainArea.inert = open;
    heroArea.inert = open;
    footerArea.inert = open;
  }

  toggle.addEventListener("click", function () {
    var open = !nav.classList.contains("is-open");
    setMenu(open);
    if (open) nav.querySelector("a").focus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  window.matchMedia("(min-width: 1320px)").addEventListener("change", function (event) {
    if (event.matches) setMenu(false);
  });

  Array.prototype.forEach.call(nav.querySelectorAll("a"), function (anchor) {
    anchor.addEventListener("click", function () {
      setMenu(false);
    });
  });

  var COUNTER_THRESHOLD = 50;

  function showVisitCounter() {
    var box = document.getElementById("visit-counter");
    var out = document.getElementById("visit-count");
    if (!box || !out || typeof fetch !== "function") return;
    var url = "https://gmyk.goatcounter.com/counter/" + encodeURIComponent(location.pathname) + ".json";
    fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        var label = lib.visitCountLabel(json, COUNTER_THRESHOLD);
        if (label === null) return;
        out.textContent = "";
        label.split("").forEach(function (digit) {
          out.appendChild(el("span", "visit-digit", digit));
        });
        box.hidden = false;
      })
      .catch(function () {});
  }

  renderProfile();
  setTab("all");
  showVisitCounter();
})();
