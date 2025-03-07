// Quand le formulaire est soumis
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Empêche le rechargement de la page

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Envoie des informations à l'API de login
  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Indique que le corps de la requête est en JSON
    },
    body: JSON.stringify({ email, password }), // Envoie l'email et le mot de passe
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Identifiants incorrects"); // Vérifie si la réponse est correcte
      }
      return response.json(); // Parse la réponse en JSON
    })
    .then((data) => {
      if (data.token) {
        // Si un token est renvoyé, le stocker dans le localStorage
        localStorage.setItem("authToken", data.token);

        // Redirige l'utilisateur vers la page d'accueil ou tableau de bord
        window.location.href = "../../index.html";
      } else {
        alert("Aucun token reçu. Veuillez réessayer.");
      }
    })
    .catch((error) => {
      console.error("Erreur :", error);
      alert("Une erreur est survenue lors de la connexion.");
    });
});
