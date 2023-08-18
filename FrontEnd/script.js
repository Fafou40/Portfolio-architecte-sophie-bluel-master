const sectionProjets = document.querySelector(".gallery");

// Fonction de gestion du clic sur les boutons de filtre
function handleFilterClick(clickedId) {
  // Change la couleur du bouton en fonction du filtre
  document.querySelectorAll(".filter__btn").forEach((btn) => {
    btn.classList.remove("filter__btn--active");
  });

  if (clickedId === null) {
    document
      .querySelector(".filter__btn-id-null")
      .classList.add("filter__btn--active");
  } else {
    document
      .querySelector(`.filter__btn-id-${clickedId}`)
      .classList.add("filter__btn--active");
  }
}

function generateFilterBtn(works, category) {
  const btn = document.createElement("button");
  btn.classList.add("filter__btn", `filter__btn-id-${category.id}`);
  btn.textContent = category.name;
  btn.addEventListener("click", () => {
    handleFilterClick(category.id); // Appelle la fonction de gestion du clic sur le bouton "Tous"
    // Appelle la fonction pour générer les projets avec le filtre sélectionné
    generationProjets(category.id);
  });
  document.querySelector(".filters").appendChild(btn);
}

// Fonction pour générer les boutons de filtre
async function generateFilterButtons(works, categories) {
  try {
    const filterCategories = [{ id: null, name: "Tous" }, ...categories];

    for (const category of filterCategories) {
      generateFilterBtn(works, category);
    }
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la récupération des catégories",
      error
    );
  }
}

async function getCategories() {
  const response = await fetch("http://localhost:5678/api/categories");
  const categories = await response.json();
  return categories;
}

async function getWorks() {
  const response = await fetch("http://localhost:5678/api/works");
  const works = await response.json();
  return works;
}

// Reset la section projets
function resetSectionProjets() {
  sectionProjets.innerHTML = "";
}

// Génère les projets
async function generationProjets(id) {
  let data = await getWorks();

  resetSectionProjets();

  // Filtre les résultats
  if ([1, 2, 3].includes(id)) {
    data = data.filter((data) => data.categoryId == id);
  }

  if (data.length === 0 || data === undefined) {
    // Aucun projet à afficher...
  }

  // Génère les projets
  if (id === null || [1, 2, 3].includes(id)) {
    for (let i = 0; i < data.length; i++) {
      const figure = document.createElement("figure");
      sectionProjets.appendChild(figure);
      figure.classList.add(`js-projet-${data[i].id}`);
      const img = document.createElement("img");
      img.src = data[i].imageUrl;
      img.alt = data[i].title;
      figure.appendChild(img);

      const figcaption = document.createElement("figcaption");
      figcaption.innerHTML = data[i].title;
      figure.appendChild(figcaption);
    }
  }
}

// INDEX : 1- GESTION BOITE MODALE
const modaleSectionProjets = document.querySelector(".js-admin-projets");

function resetmodaleSectionProjets() {
  modaleSectionProjets.innerHTML = "";
}

async function modaleProjets() {
  const response = await fetch("http://localhost:5678/api/works");
  const dataAdmin = await response.json();
  resetmodaleSectionProjets();

  for (let i = 0; i < dataAdmin.length; i++) {
    const div = document.createElement("div");
    div.classList.add("gallery__item-modale");
    modaleSectionProjets.appendChild(div);

    const img = document.createElement("img");
    img.src = dataAdmin[i].imageUrl;
    img.alt = dataAdmin[i].title;
    div.appendChild(img);

    const p = document.createElement("p");
    div.appendChild(p);
    p.classList.add(dataAdmin[i].id, "js-delete-work");

    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-trash-can");
    p.appendChild(icon);

    const a = document.createElement("a");
    a.innerHTML = "Éditer";
    div.appendChild(a);
  }

  // Appeler la fonction deleteWork 
  deleteWork();
}

async function refreshPage(i) {
  modaleProjets();
  const projet = document.querySelector(`.js-projet-${i}`);
  projet.style.display = "none";
}

function openModale(e) {
  e.preventDefault();
  modale = document.querySelector(e.target.getAttribute("href"));
  modaleProjets();
  setTimeout(() => {
    modale.style.display = null;
    modale.removeAttribute("aria-hidden");
    modale.setAttribute("aria-modal", "true");
  }, 25);

  document.querySelectorAll(".js-modale-projet").forEach((a) => {
    a.addEventListener("click", openModaleProjet);
  });
  modale.addEventListener("click", closeModale);
  modale.querySelector(".js-modale-close").addEventListener("click", closeModale);
  modale.querySelector(".js-modale-stop").addEventListener("click", stopPropagation);
}

function closeModale(e) {
  e.preventDefault();
  if (modale === null) return;
  modale.setAttribute("aria-hidden", "true");
  modale.removeAttribute("aria-modal");
  modale.querySelector(".js-modale-close").removeEventListener("click", closeModale);
  window.setTimeout(function () {
    modale.style.display = "none";
    modale = null;
    resetmodaleSectionProjets();
  }, 300);
}

function stopPropagation(e) {
  e.stopPropagation();
}

document.querySelectorAll(".js-modale").forEach((a) => {
  a.addEventListener("click", openModale);
});

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModale(e);
    closeModaleProjet(e);
  }
});

// INDEX : 2- GESTION TOKEN LOGIN
const token = localStorage.getItem("token");
const AlredyLogged = document.querySelector(".js-alredy-logged");

function adminPanel() {
  document.querySelectorAll(".admin__modifer").forEach((a) => {
    if (token !== null) {
      a.removeAttribute("aria-hidden");
      a.removeAttribute("style");
      AlredyLogged.innerHTML = "deconnexion";
    }
  });
}

adminPanel();

// INDEX : 3- GESTION SUPPRESSION D'UN PROJET
function deleteWork() {
  let btnDelete = document.querySelectorAll(".js-delete-work");
  for (let i = 0; i < btnDelete.length; i++) {
    btnDelete[i].addEventListener("click", deleteProjets);
  }
}

async function deleteProjets() {
  console.log("DEBUG DEBUT DE FUNCTION SUPRESSION");
  console.log(this.classList[0]);
  console.log(token);

  await fetch(`http://localhost:5678/api/works/${this.classList[0]}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => {
      console.log(response);
      // Token good
      if (response.status === 204) {
        console.log("DEBUG SUPPRESION DU PROJET " + this.classList[0]);
        refreshPage(this.classList[0]);
      }
      // Token inorrect
      else if (response.status === 401) {
        alert(
          "Vous n'êtes pas autorisé à supprimer ce projet, merci de vous connecter avec un compte valide"
        );
        window.location.href = "login.html";
      }
    })
    .catch((error) => {
      console.log(error);
    });
}


// INDEX : 4- GESTION BOITE MODALE AJOUT PROJET
let modaleProjet = null;
const openModaleProjet = function (e) {
  e.preventDefault();
  modaleProjet = document.querySelector(e.target.getAttribute("href"));
  modaleProjet.style.display = null;
  modaleProjet.removeAttribute("aria-hidden");
  modaleProjet.setAttribute("aria-modal", "true");
  modaleProjet.addEventListener("click", closeModaleProjet);
  modaleProjet.querySelector(".js-modale-close").addEventListener("click", closeModaleProjet);
  modaleProjet.querySelector(".js-modale-stop").addEventListener("click", stopPropagation);
  modaleProjet.querySelector(".js-modale-return").addEventListener("click", backToModale);
};

const closeModaleProjet = function (e) {
  if (modaleProjet === null) return;
  modaleProjet.setAttribute("aria-hidden", "true");
  modaleProjet.removeAttribute("aria-modal");
  modaleProjet.querySelector(".js-modale-close").removeEventListener("click", closeModaleProjet);
  modaleProjet.querySelector(".js-modale-stop").removeEventListener("click", stopPropagation);
  modaleProjet.style.display = "none";
  modaleProjet = null;
  closeModale(e);
};

const backToModale = function (e) {
  e.preventDefault();
  modaleProjet.style.display = "none";
  modaleProjet = null;
  modaleProjets(dataAdmin);
};

// INDEX : 5- GESTION AJOUT D'UN PROJET
const btnAjouterProjet = document.querySelector(".js-add-work");
btnAjouterProjet.addEventListener("click", addWork);

async function addWork(event) {
  event.preventDefault();

  const title = document.querySelector(".js-title").value;
  const categoryId = document.querySelector(".js-categoryId").value;
  const image = document.querySelector(".js-image").files[0];

  if (title === "" || categoryId === "" || image === undefined) {
    alert("Merci de remplir tous les champs");
    return;
  } else if (categoryId !== "1" && categoryId !== "2" && categoryId !== "3") {
    alert("Merci de choisir une catégorie valide");
    return;
  } else {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", categoryId);
      formData.append("image", image);

      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 201) {
        alert("Projet ajouté avec succès :)");
        modaleProjets(dataAdmin);
        backToModale(event);
        generationProjets(null);
      } else if (response.status === 400) {
        alert("Merci de remplir tous les champs");
      } else if (response.status === 500) {
        alert("Erreur serveur");
      } else if (response.status === 401) {
        alert("Vous n'êtes pas autorisé à ajouter un projet");
        window.location.href = "login.html";
      }
    } catch (error) {
      console.log(error);
    }
  }
}

// INDEX : 6- GESTION GENERALE
async function generateFilterButtonsAndProjects() {
  try {
    const works = await getWorks();
    const categories = await getCategories();

    // Génération des boutons de filtre
    await generateFilterButtons(works, categories);

    // Génère les projets avec le filtre "Tous" au chargement de la page
    await generationProjets(null);

    // Gestion de l'affichage des boutons admin
    adminPanel();

    // Supprimer le projet
    deleteWork();

    // Ajouter un projet
    btnAjouterProjet.addEventListener("click", addWork);

  } catch (error) {
    console.error("Une erreur est survenue lors de la récupération des données", error);
  }
}

async function initializeVariables() {
  let dataAdmin;

  const response = await fetch("http://localhost:5678/api/works");
  dataAdmin = await response.json();

  return { dataAdmin };
}

async function startApp() {
  try {
    const { dataAdmin } = await initializeVariables();
    generateFilterButtonsAndProjects();
  } catch (error) {
    console.error("Une erreur est survenue lors de la récupération des données", error);
  }
}

startApp();
