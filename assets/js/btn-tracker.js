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

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/.netlify/functions/track-click",
          JSON.stringify(data)
        );
      } else {
        fetch("/.netlify/functions/track-click", {
          method: "POST",
          body: JSON.stringify(data),
          keepalive: true
        }).catch(function () {});
      }
    });
  });
})();
