(function () {
  var email = "helenenguyen.psychologue@gmail.com";
  var subject = "Demande de rendez-vous";
  var body = [
    "Bonjour Madame Nguyen,",
    "",
    "Je souhaite prendre rendez-vous.",
    "",
    "Voici mes préférences :",
    "- Jour souhaité : ",
    "- Créneau horaire : ",
    "- Format (cabinet ou visio) : ",
    "- Motif bref : ",
    "",
    "Cordialement,",
    "",
    "[Votre prénom et nom]",
    "[Votre téléphone]"
  ].join("\r\n");

  var url = "mailto:" + email
    + "?subject=" + encodeURIComponent(subject)
    + "&body=" + encodeURIComponent(body);

  var nodes = document.querySelectorAll("[data-mailto-rdv]");
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].setAttribute("href", url);
  }
})();
