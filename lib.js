(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PortfolioLib = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var CATEGORIES = { post: "発信", dev: "開発" };

  function hasCategory(value) {
    return Object.prototype.hasOwnProperty.call(CATEGORIES, value);
  }

  function nonEmpty(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function isHttps(value) {
    return typeof value === "string" && value.indexOf("https://") === 0;
  }

  function isRelativePath(value) {
    return nonEmpty(value) && !/^(\/|[a-z][a-z0-9+.-]*:)/i.test(value) && value.indexOf("\\") === -1;
  }

  function isRealDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    var parsed = new Date(value + "T00:00:00Z");
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }

  function sortItems(items) {
    return items.slice().sort(function (a, b) {
      if (a.date === b.date) return 0;
      return a.date < b.date ? 1 : -1;
    });
  }

  function filterItems(items, tab) {
    if (tab === "all") return items.slice();
    return items.filter(function (item) {
      return item.category === tab;
    });
  }

  function isLinkable(item) {
    return isHttps(item.url);
  }

  function collectUrls(data) {
    var urls = [];
    function add(url) {
      if (typeof url === "string" && urls.indexOf(url) === -1) urls.push(url);
    }
    data.profile.links.forEach(function (link) {
      add(link.url);
    });
    data.profile.activities.forEach(function (activity) {
      add(activity.url);
    });
    data.items.forEach(function (item) {
      add(item.url);
    });
    return urls;
  }

  function validateData(data) {
    var errors = [];
    var profile = data && data.profile;

    if (!profile || typeof profile !== "object") {
      errors.push("profile: missing");
    } else {
      if (!nonEmpty(profile.name)) errors.push("profile.name: required");
      if (!nonEmpty(profile.tagline)) errors.push("profile.tagline: required");
      if (!(profile.avatar === null || isRelativePath(profile.avatar))) {
        errors.push("profile.avatar: must be null or a relative path");
      }
      if (!Array.isArray(profile.intro) || profile.intro.length === 0 || !profile.intro.every(nonEmpty)) {
        errors.push("profile.intro: need a non-empty array of strings");
      }
      if (!Array.isArray(profile.links)) {
        errors.push("profile.links: must be an array");
      } else {
        profile.links.forEach(function (link, i) {
          var at = "profile.links[" + i + "]";
          if (!link || !nonEmpty(link.label)) errors.push(at + ".label: required");
          if (!link || !isHttps(link.url)) errors.push(at + ".url: must start with https://");
          if (!link || !nonEmpty(link.icon)) errors.push(at + ".icon: required");
          if (link && link.image !== undefined && !(link.image === null || isRelativePath(link.image))) {
            errors.push(at + ".image: must be null or a relative path");
          }
        });
      }
      if (!Array.isArray(profile.activities)) {
        errors.push("profile.activities: must be an array");
      } else {
        profile.activities.forEach(function (activity, i) {
          var at = "profile.activities[" + i + "]";
          if (!activity || !nonEmpty(activity.name)) errors.push(at + ".name: required");
          if (!activity || !nonEmpty(activity.summary)) errors.push(at + ".summary: required");
          if (!activity || !(activity.url === null || isHttps(activity.url))) {
            errors.push(at + ".url: must be null or start with https://");
          }
        });
      }
    }

    var items = data && data.items;
    if (!Array.isArray(items)) {
      errors.push("items: must be an array");
    } else {
      items.forEach(function (item, i) {
        var at = "items[" + i + "]";
        if (!item || typeof item !== "object") {
          errors.push(at + ": must be an object");
          return;
        }
        if (!hasCategory(item.category)) {
          errors.push(at + ".category: must be one of " + Object.keys(CATEGORIES).join(", "));
        }
        if (!nonEmpty(item.kind)) errors.push(at + ".kind: required");
        if (!nonEmpty(item.title)) errors.push(at + ".title: required");
        if (!nonEmpty(item.summary)) errors.push(at + ".summary: required");
        if (!isRealDate(item.date)) errors.push(at + ".date: invalid date " + JSON.stringify(item.date));
        if (!(item.url === null || isHttps(item.url))) {
          errors.push(at + ".url: must be null or start with https://");
        }
        if (!(item.thumb === null || isRelativePath(item.thumb))) {
          errors.push(at + ".thumb: must be null or a relative path");
        }
      });
    }

    return errors;
  }

  return {
    CATEGORIES: CATEGORIES,
    sortItems: sortItems,
    filterItems: filterItems,
    isLinkable: isLinkable,
    collectUrls: collectUrls,
    validateData: validateData,
  };
});
