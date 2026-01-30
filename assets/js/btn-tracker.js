(function () {
  "use strict";

  var trackedButtons = document.querySelectorAll("[data-track-btn]");

  trackedButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var buttonId = btn.getAttribute("data-track-btn");

      var data = {
        buttonId: buttonId,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer || null
      };

      var jsonString = JSON.stringify(data);
      var blob = new Blob([jsonString], { type: "application/json" });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/.netlify/functions/track-click", blob);
      } else {
        fetch("/.netlify/functions/track-click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: jsonString,
          keepalive: true
        }).catch(function () {});
      }
    });
  });
})();
