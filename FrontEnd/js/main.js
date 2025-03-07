document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM chargé");
  
    const token = localStorage.getItem("authToken");
    const loginLink = document.getElementById("loginLink");
    const filtersContainer = document.getElementById("categoriesFilter");
  
    // Afficher la bannière si l'utilisateur est connecté
    if (token && token.trim() !== "") {
      afficherBanniereConnecte();
      afficherTitreEtModifier();
      loginLink.textContent = "Log out";
      loginLink.href = "#";
      if (filtersContainer) filtersContainer.classList.add("hidden");
  
      loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("authToken");
        supprimerBanniere(); // Supprimer la bannière avant de recharger
        window.location.reload();
      });
    } else {
      // Si l'utilisateur n'est pas connecté, ne pas afficher la bannière
      loginLink.textContent = "Log in";
      loginLink.href = "./FrontEnd/pages/login.html";
    }
  
    fetch("http://localhost:5678/api/works")
      .then(response => response.json())
      .then(data => {
        afficherFiltres(data);
        afficherProjets(data);
      })
      .catch(error => {
        console.error("Erreur :", error);
        document.querySelector(".gallery").innerHTML = "<p>Impossible de charger les projets.</p>";
      });
  
    if (document.querySelector(".modifier-text")) {
      document.querySelector(".modifier-text").addEventListener("click", createModal);
    }
  });
  
  // Supprimer la bannière
  function supprimerBanniere() {
    const banner = document.getElementById("banner");
    if (banner) {
      banner.remove();
      document.body.style.paddingTop = "0px"; // Réajuster le padding du body
    }
  }
  
  // Affichage des filtres
  function afficherFiltres(data) {
    const filtersContainer = document.querySelector("#categoriesFilter");
    if (!filtersContainer) return;
  
    const categoriesSet = new Set(["Tous"]);
    data.forEach(projet => projet.category && categoriesSet.add(projet.category.name));
  
    filtersContainer.innerHTML = "";
    [...categoriesSet].forEach(category => {
      const li = document.createElement("li");
      li.classList.add("filter");
      li.textContent = category;
      filtersContainer.appendChild(li);
  
      li.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach(filter => filter.classList.remove("selected"));
        li.classList.add("selected");
  
        const filteredData = category === "Tous" ? data : data.filter(projet => projet.category.name === category);
        afficherProjets(filteredData);
      });
    });
  }
  
  // Affichage des projets
  function afficherProjets(data) {
    const gallery = document.querySelector(".gallery");
    if (!gallery) return;
  
    gallery.innerHTML = "";
    data.forEach(projet => {
      const figure = document.createElement("figure");
      figure.setAttribute("data-id", projet.id);
  
      const img = document.createElement("img");
      img.src = projet.imageUrl;
      img.alt = projet.title;
  
      const caption = document.createElement("figcaption");
      caption.textContent = projet.title;
  
      figure.appendChild(img);
      figure.appendChild(caption);
      gallery.appendChild(figure);
    });
  }
  
  // Bannières
  function afficherBanniereConnecte() {
    const banner = document.createElement("div");
    banner.id = "banner";
    banner.innerHTML = `<p><i class="fa-regular fa-pen-to-square"></i> Mode édition</p>`;
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.style.paddingTop = "50px";
  }
  
  function afficherBanniereNonConnecte() {
    const banner = document.createElement("div");
    banner.id = "banner";
    banner.innerHTML = `<span class="banner-text">Mode édition</span>`;
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.style.paddingTop = "50px";
  }
  
  // Affichage du bouton "Modifier"
  function afficherTitreEtModifier() {
    const projetEditContainer = document.querySelector(".projetEdit");
    if (!projetEditContainer) return;
  
    const modifierText = document.createElement("span");
    modifierText.classList.add("modifier-text");
    modifierText.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Modifier`;
    modifierText.addEventListener("click", createModal);
  
    const titreMesProjets = projetEditContainer.querySelector("h2");
    if (titreMesProjets) {
      projetEditContainer.insertBefore(modifierText, titreMesProjets.nextSibling);
    }
  }
  
  // Modal
  function createModal() {
    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");
    modal.innerHTML = `
    <div class="modal">
      <span class="close">&times;</span>
      <div class="modal-content">
        <!-- Vue galerie : cette vue doit être active par défaut -->
        <div class="view view-gallery active">
          <h2 class="modal-title">Galerie de projets</h2>
          <div class="gallery-modal"></div>
          <hr class="modal-divider">
          <button class="open-add-view">Ajouter une photo</button>
        </div>
        <!-- Vue ajout de projet -->
        <div class="view view-add">
        <button class="back-to-gallery"><i class="fas fa-arrow-left"></i></button>
          <h2 class="modal-title">Ajout photo</h2>
          <form id="addProjectForm">
              <label for="projectImage">
                <div class="imageUpload">
                  <i class="fas fa-image"></i>
                  <div class="addPhoto">+ Ajouter photo</div>
                  <p class="descriptionPhoto">jpg, png : 4mo max</p>
                </div>
              </label>
              <input type="file" id="projectImage" required />
  
              <label for="title">Titre</label>
              <input type="text" id="projectTitle" placeholder="Titre" required />
  
              <label for="category">Catégorie</label>
              <select id="projectCategory" required></select>
              <hr class="modal-divider">
              <button type="submit" class="submitFormulaire">Valider</button>
          </form>
          
        </div>
      </div>
    </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector(".close").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  
    // Lorsque l'utilisateur clique pour passer à la vue "ajouter un projet"
    modal.querySelector(".open-add-view").addEventListener("click", () => {
        switchView("add"); // Passer à la vue d'ajout
    });
  
    // Lorsque l'utilisateur clique pour revenir à la vue "galerie"
    modal.querySelector(".back-to-gallery").addEventListener("click", () => {
        switchView("gallery"); // Retourner à la vue galerie
    });
  
    loadGalleryInModal();
    loadCategories();
    modal.querySelector("#addProjectForm").addEventListener("submit", handleProjectSubmit);
  }
  
  // Fonction pour changer de vue dans la modale
  function switchView(view) {
    console.log(`Changement de vue vers: ${view}`);
    
    // Retirer la classe 'active' de toutes les vues
    document.querySelectorAll('.view').forEach(vue => {
      vue.classList.remove('active');
    });
  
    // Ajouter la classe 'active' à la vue correspondante
    const targetView = document.querySelector(`.view-${view}`);
    
    if (targetView) {
      targetView.classList.add('active');
    } else {
      console.log(`Aucune vue trouvée pour : ${view}`);
    }
  }
  
  // Charger la galerie dans la modale
  function loadGalleryInModal() {
    fetch("http://localhost:5678/api/works")
      .then(response => response.json())
      .then(data => {
        const gallery = document.querySelector(".gallery-modal");
        if (!gallery) return;
        gallery.innerHTML = ""; // Réinitialiser la galerie pour la remplir de nouveau
        data.forEach(projet => {
          const figure = document.createElement("figure");
          figure.innerHTML = `
            <img src="${projet.imageUrl}" alt="${projet.title}" />
            <button class="delete-btn" data-id="${projet.id}">
              <i class="fa fa-trash"></i> <!-- Icône corbeille de FontAwesome -->
            </button>`;
          gallery.appendChild(figure);
        });
  
        // Ajouter un écouteur d'événement pour chaque bouton de suppression
        document.querySelectorAll(".delete-btn").forEach(btn =>
          btn.addEventListener("click", deleteProject)
        );
      });
  }
  
  // Supprimer un projet
  function deleteProject(event) {
    const projectId = event.target.getAttribute("data-id"); // Récupérer l'ID du projet
    console.log("Suppression du projet avec ID : " + projectId); // Pour déboguer
  
    // Afficher un message de confirmation
    const confirmation = confirm("Êtes-vous sûr de vouloir supprimer ce projet ?");
  
    if (!confirmation) {
      console.log("Suppression annulée");
      return; // Si l'utilisateur annule, on arrête la fonction
    }
  
    // Récupérer le token d'authentification dans le localStorage
    const token = localStorage.getItem("authToken");
  
    if (!token) {
      alert("Vous devez être connecté pour supprimer un projet.");
      return;
    }
  
    // Effectuer la requête DELETE avec le token dans les headers
    fetch(`http://localhost:5678/api/works/${projectId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}` // Ajouter le token dans les headers
      }
    })
      .then(response => {
        if (response.ok) {
          console.log(`Projet supprimé avec succès ! ID: ${projectId}`);
          // Recharge la galerie après la suppression
          loadGalleryInModal(); // Recharge la galerie avec les projets restants
        } else {
          console.error("Échec de la suppression du projet.");
          alert("Impossible de supprimer le projet. Essayez à nouveau.");
        }
      })
      .catch(error => {
        console.error("Erreur de suppression :", error);
        alert("Une erreur s'est produite. Veuillez réessayer.");
      });
  }
  
  // Charger les catégories dans le formulaire d'ajout
  function loadCategories() {
    fetch("http://localhost:5678/api/categories")
      .then(response => response.json())
      .then(categories => {
        const select = document.querySelector("#projectCategory");
        categories.forEach(category => {
          const option = document.createElement("option");
          option.value = category.id;
          option.textContent = category.name;
          select.appendChild(option);
        });
      })
      .catch(error => console.error("Erreur de chargement des catégories", error));
  }
  
  // Gérer la soumission du formulaire d'ajout de projet
  function handleProjectSubmit(event) {
    event.preventDefault();
  
    const title = document.querySelector("#projectTitle").value;
    const category = document.querySelector("#projectCategory").value;
    const image = document.querySelector("#projectImage").files[0];
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("image", image);
  
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Vous devez être connecté pour ajouter un projet.");
      return;
    }
  
    fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        console.log("Projet ajouté avec succès", data);
        loadGalleryInModal(); // Recharger la galerie après l'ajout
        switchView("gallery"); // Retourner à la vue galerie
      })
      .catch(error => {
        console.error("Erreur lors de l'ajout du projet", error);
        alert("Erreur lors de l'ajout du projet.");
      });
  }
  