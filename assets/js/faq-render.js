(function () {
  const data = window.FAQ_DATA;
  if (!data) return;

  const makeDetails = (item) => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const p = document.createElement("p");

    summary.textContent = item.q;
    p.textContent = item.a;

    details.appendChild(summary);
    details.appendChild(p);
    return details;
  };

  const render = (container) => {
    const pageKey = container.getAttribute("data-faq-page");
    const specific = pageKey && data.specific[pageKey] ? data.specific[pageKey] : [];
    const items = specific.concat(data.generic);

    items.forEach((item) => {
      container.appendChild(makeDetails(item));
    });
  };

  const containers = document.querySelectorAll("[data-faq]");
  containers.forEach(render);

  const jsonLdHost = document.querySelector("[data-faq-jsonld='true']");
  if (jsonLdHost) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": data.generic.map((item) => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);
  }
})();
