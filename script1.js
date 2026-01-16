// ============================================
// --- 1. MENU TOGGLE MOBILE ---
// ============================================

function toggleMenu() {
    const menu = document.getElementById('navMenu');
    menu.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
});

// ============================================
// --- 2. MENU ACTIF AUTOMATIQUE (SCROLL SPY) ---
// ============================================

function updateActiveMenu() {
    const sections = document.querySelectorAll('main[id], section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length === 0) return;

    let currentId = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= (sectionTop - 150)) {
            currentId = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (currentId && link.getAttribute('href').includes(currentId)) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveMenu);
window.addEventListener('load', updateActiveMenu);


// ============================================
// --- 3. SCROLL REVEAL ANIMATION ---
// ============================================

function scrollReveal() {
    const revealPoint = window.innerHeight * 0.15;
    const elementsToReveal = document.querySelectorAll('.js-scroll');

    elementsToReveal.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;

        if (elementTop < window.innerHeight - revealPoint && elementBottom > revealPoint) {
            element.classList.add('is-visible');
        }
    });
}

window.addEventListener('scroll', scrollReveal);
window.addEventListener('resize', scrollReveal);
window.addEventListener('DOMContentLoaded', scrollReveal);


// ============================================
// --- 4. LOGIQUE DU QUIZ (DIAGNOSTIC) ---
// ============================================

// Stockage des réponses utilisateur
let userAnswers = {
    type: null,
    porosity: null,
    needs: []
};

// --- Fonction qui met à jour la barre et active le bouton ---
function updateProgressBar() {
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    const submitBtn = document.getElementById('submitBtn');
    
    // ÉTAT DE DÉPART : 0% (Vide)
    let percent = 0;
    let currentQuestion = 1;

    // Calcul de l'avancement
    if (userAnswers.type) {
        percent = 33;
        currentQuestion = 2;
    }
    if (userAnswers.type && userAnswers.porosity) {
        percent = 66;
        currentQuestion = 3;
    }
    
    // Vérification si le quiz est complet
    const isComplete = userAnswers.type && userAnswers.porosity && userAnswers.needs.length > 0;

    if (isComplete) {
        percent = 100;
    }

    // Mise à jour visuelle de la barre
    if (fill) fill.style.width = percent + '%';
    
    if (text) {
        if (percent === 100) {
            text.innerText = "Diagnostic complet !";
        } else {
            text.innerText = `Question ${currentQuestion} sur 3`;
        }
    }

    // Activation / Désactivation du bouton
    if (submitBtn) {
        if (isComplete) {
            submitBtn.disabled = false; // Active le bouton
        } else {
            submitBtn.disabled = true;  // Désactive le bouton
        }
    }
}

// --- Scroll automatique vers la prochaine question ---
function scrollToNextQuestion(nextQuestionId) {
    const nextQ = document.getElementById(nextQuestionId);
    if (nextQ) {
        setTimeout(() => {
            nextQ.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
    }
}

// Fonction pour sélection unique (Type & Porosité)
function selectOption(element, category) {
    let parent = element.parentElement;
    let siblings = parent.getElementsByClassName('option');
    for (let sib of siblings) {
        sib.classList.remove('selected');
    }
    
    element.classList.add('selected');
    userAnswers[category] = element.getAttribute('data-value');

    updateProgressBar();

    // Scroll auto
    if (category === 'type') {
        scrollToNextQuestion('q2');
    } else if (category === 'porosity') {
        scrollToNextQuestion('q3');
    }
}

// Fonction pour sélection multiple (Besoins)
function toggleOption(element) {
    element.classList.toggle('selected');
    let value = element.getAttribute('data-value');
    
    if (userAnswers.needs.includes(value)) {
        userAnswers.needs = userAnswers.needs.filter(item => item !== value);
    } else {
        userAnswers.needs.push(value);
    }
    
    updateProgressBar();
}

// ============================================
// --- 5. BASE DE DONNÉES PRODUITS ---
// ============================================
const productsDB = [
    {
        name: "Shampoing Or & Miel",
        desc: "Hydratation profonde pour cheveux crépus.",
        tags: ["type4", "faible", "hydratation"]
    },
    {
        name: "Elixir de Soie",
        desc: "Définition légère pour boucles aériennes.",
        tags: ["type3", "definition"]
    },
    {
        name: "Masque Caviar Réparateur",
        desc: "Reconstruction intense pour forte porosité.",
        tags: ["forte"]
    },
    {
        name: "Brume Volumatrice",
        desc: "Volume instantané sans effet carton.",
        tags: ["volume", "type3"]
    },
    {
        name: "Beurre Royal Karité",
        desc: "Nutrition suprême pour sceller l'hydratation.",
        tags: ["type4", "hydratation"]
    }
];

// ============================================
// --- 6. AFFICHAGE DES RÉSULTATS (NETTOYÉ) ---
// ============================================
/* --- Dans script1.js --- */

function showResults() {
    console.log("Calcul des résultats en cours..."); // Vérification dans la console (F12)

    // 1. Récupération des éléments
    const quizSection = document.getElementById('quiz');
    const resultsDiv = document.getElementById('results');
    const progressContainer = document.querySelector('.progress-container');
    const headerTitle = document.querySelector('.page-header h1');
    const headerSubtitle = document.querySelector('.page-header .subtitle');
    const container = document.getElementById('productList');

    // 2. Masquer le quiz
    if (quizSection) quizSection.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';
    if (headerSubtitle) headerSubtitle.style.display = 'none';

    // 3. Changer le titre
    if (headerTitle) headerTitle.innerText = "Votre Routine Idéale ✨";

    // 4. Afficher la boite de résultats (IMPORTANT)
    if (resultsDiv) {
        resultsDiv.style.display = 'block';
        resultsDiv.style.opacity = '1'; // On force la visibilité
    }

    // 5. Filtrer les produits
    container.innerHTML = ""; // On vide la liste
    
    // Logique de filtrage (OU)
    let matches = productsDB.filter(product => {
        return product.tags.includes(userAnswers.type) || 
               product.tags.includes(userAnswers.porosity) ||
               userAnswers.needs.some(need => product.tags.includes(need));
    });

    console.log("Produits trouvés : ", matches.length); // Vérification nombre produits

    // 6. Création des cartes HTML
    if (matches.length > 0) {
        matches.forEach(product => {
            let card = document.createElement('div');
            card.className = 'product-result-card';
            // On s'assure que le style est visible directement dans le HTML
            card.style.opacity = '1'; 
            card.style.display = 'block';
            
            card.innerHTML = `
                <h3 style="color: #D4AF37; margin-bottom: 10px;">${product.name}</h3>
                <p style="color: #ddd;">${product.desc}</p>
            `;
            container.appendChild(card);
        });
    } else {
        container.innerHTML = "<p style='color: white; text-align:center;'>Aucun produit spécifique trouvé. Contactez-nous !</p>";
    }
    
    // 7. Scroll vers le haut pour voir le titre
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// --- 7. ANIMATIONS SCROLL NOTRE MAISON ---
// ============================================

function revealOnScrollMaison() {
    const elements = document.querySelectorAll('.js-scroll, .timeline-item, .valeur-card-modern');
    const windowHeight = window.innerHeight;

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const revealPoint = windowHeight * 0.85;

        if (elementTop < revealPoint) {
            element.classList.add('is-visible');
        }
    });
}

// Vérifier si on est sur la page Notre Maison
if (document.querySelector('.maison-body')) {
    window.addEventListener('scroll', revealOnScrollMaison);
    window.addEventListener('DOMContentLoaded', revealOnScrollMaison);
    window.addEventListener('load', revealOnScrollMaison);
}