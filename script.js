/* ==============================
   HEWAD IT - JAVASCRIPT
================================ */


/* NAVIGATION ITEMS */

const navItems = [
    ["Home", "index.html"],
    ["About", "about.html"],
    ["Services", "services.html"],
    ["Projects", "projects.html"],
    ["Team", "team.html"],
    ["Blog", "blog.html"],
    ["Contact", "contact.html"]
];


/* CURRENT PAGE */

const currentFile =
    location.pathname.split("/").pop() || "index.html";


/* CREATE HEADER */

const header = document.getElementById("site-header");

if (header) {

    header.innerHTML = `

        <div class="topbar">
            <div class="container topbar-inner">

                <div>
                    <span>
                        <i class="fa-regular fa-envelope"></i>
                        info@hewadit.com
                    </span>

                    <span>
                        <i class="fa-solid fa-location-dot"></i>
                        Kabul, Afghanistan
                    </span>
                </div>

                <div>
                    <span>
                        <i class="fa-regular fa-clock"></i>
                        Sat – Thu · 9:00–17:00
                    </span>
                </div>

            </div>
        </div>


        <header class="navbar-main">

            <div class="container nav-inner">

                <a class="brand" href="index.html">
                    <span class="brand-mark">H</span>
                    Hewad IT
                </a>


                <button
                    class="menu-toggle"
                    id="menuToggle"
                    aria-label="Toggle navigation"
                    aria-expanded="false"
                >
                    <i class="fa-solid fa-bars"></i>
                </button>


                <nav class="nav-links" id="navLinks">

                    ${navItems.map(([label, url]) => `
                        <a
                            href="${url}"
                            class="${currentFile === url ? 'active' : ''}"
                        >
                            ${label}
                        </a>
                    `).join("")}

                    <button
                        class="theme-toggle"
                        id="themeToggle"
                        type="button"
                        aria-label="Switch to dark mode"
                        title="Dark mode"
                    >
                        <i class="fa-solid fa-moon"></i>
                    </button>

                </nav>

            </div>

        </header>

    `;

}


/* CREATE FOOTER */

const footer = document.getElementById("site-footer");

if (footer) {

    footer.innerHTML = `

        <footer class="footer">

            <div class="container">

                <div class="footer-grid">


                    <!-- COMPANY -->

                    <div>

                        <a class="brand" href="index.html">
                            <span class="brand-mark">H</span>
                            Hewad IT
                        </a>

                        <p>
                            Innovating today. Building tomorrow.
                            Digital solutions with purpose in
                            Kabul, Afghanistan.
                        </p>

                        <div class="socials">

                            <a href="#" aria-label="Facebook">
                                <i class="fa-brands fa-facebook-f"></i>
                            </a>

                            <a href="#" aria-label="LinkedIn">
                                <i class="fa-brands fa-linkedin-in"></i>
                            </a>

                            <a href="#" aria-label="Instagram">
                                <i class="fa-brands fa-instagram"></i>
                            </a>

                        </div>

                    </div>


                    <!-- EXPLORE -->

                    <div>

                        <h4>Explore</h4>

                        <div class="footer-links">

                            <a href="about.html">About Us</a>

                            <a href="services.html">Our Services</a>

                            <a href="projects.html">Projects</a>

                            <a href="team.html">Our Team</a>

                        </div>

                    </div>


                    <!-- SERVICES -->

                    <div>

                        <h4>What We Do</h4>

                        <div class="footer-links">

                            <a href="services.html">Web Development</a>

                            <a href="services.html">Software Solutions</a>

                            <a href="services.html">Mobile Applications</a>

                            <a href="services.html">IT Consulting</a>

                        </div>

                    </div>


                    <!-- CONTACT -->

                    <div>

                        <h4>Contact</h4>

                        <div class="footer-links">

                            <span>Kabul, Afghanistan</span>

                            <a href="mailto:info@hewadit.com">
                                info@hewadit.com
                            </a>

                            <span>
                                Replace sample contact details
                                with official information.
                            </span>

                        </div>

                    </div>


                </div>


                <!-- COPYRIGHT -->

                <div class="footer-bottom">

                    <span>
                        © <span id="year"></span>
                        Hewad IT. All rights reserved.
                    </span>

                    <span>
                        Designed with care · Kabul, Afghanistan
                    </span>

                </div>

            </div>

        </footer>

    `;


    document.getElementById("year").textContent =
        new Date().getFullYear();

}


/* MOBILE MENU */

const toggle =
    document.getElementById("menuToggle");

const nav =
    document.getElementById("navLinks");


if (toggle && nav) {

    toggle.addEventListener("click", () => {

        const opened = nav.classList.toggle("open");

        toggle.setAttribute(
            "aria-expanded",
            String(opened)
        );

        toggle.innerHTML = opened
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';

    });

}


/* THEME TOGGLE */

const themeToggle =
    document.getElementById("themeToggle");

const savedTheme =
    localStorage.getItem("hewad-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}

if (themeToggle) {

    const updateThemeButton = () => {
        const dark =
            document.body.classList.contains("dark-mode");

        themeToggle.innerHTML = dark
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';

        themeToggle.setAttribute(
            "aria-label",
            dark ? "Switch to light mode" : "Switch to dark mode"
        );
        themeToggle.setAttribute(
            "title",
            dark ? "Light mode" : "Dark mode"
        );
    };

    updateThemeButton();

    themeToggle.addEventListener("click", () => {
        const dark =
            document.body.classList.toggle("dark-mode");

        localStorage.setItem(
            "hewad-theme",
            dark ? "dark" : "light"
        );

        updateThemeButton();
    });

}


/* PROJECT FILTER */

document.querySelectorAll("[data-filter]").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll("[data-filter]")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        const filter = button.dataset.filter;

        document.querySelectorAll(
            ".project-list [data-category]"
        ).forEach(card => {

            if (
                filter === "all" ||
                card.dataset.category === filter
            ) {

                card.style.display = "";

            } else {

                card.style.display = "none";

            }

        });

    });

});


/* CONTACT FORM */

const form = document.getElementById("contactForm");

if (form) {

    form.addEventListener("submit", async event => {
        event.preventDefault();
        const note = document.getElementById("formNote");
        const button = form.querySelector('button[type="submit"]');
        const buttonText = button.textContent;
        const fields = Object.fromEntries(new FormData(form).entries());

        note.textContent = "";
        button.disabled = true;
        button.textContent = "Sending...";

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields)
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to send your message.");
            }

            note.textContent = result.message;
            form.reset();
        } catch (error) {
            note.textContent = error instanceof Error
                ? error.message
                : "Unable to send your message. Please try again.";
        } finally {
            button.disabled = false;
            button.textContent = buttonText;
        }
    });

}


/* SCROLL ANIMATIONS */

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("visible");

            observer.unobserve(entry.target);

        }

    });

}, {
    threshold: 0.12
});


document.querySelectorAll(
    ".hero-copy, .hero-visual, .service-card, .project-card, .blog-card, .team-card, .split > div"
).forEach(element => {

    element.classList.add("reveal");

    observer.observe(element);

});
/* BLOG ARTICLES */

const featuredArticles = document.getElementById("featuredArticles");
const moreArticles = document.getElementById("moreArticles");

function createArticleCard(article) {
    const card = document.createElement("article");
    card.className = "blog-card";

    const image = document.createElement("img");
    image.src = article.image;
    image.alt = article.imageAlt;
    image.loading = "lazy";

    const content = document.createElement("div");
    const metadata = document.createElement("small");
    metadata.textContent = article.readMinutes
        ? `${article.category} · ${article.readMinutes} MIN READ`
        : article.category;

    const title = document.createElement("h3");
    title.textContent = article.title;

    const excerpt = document.createElement("p");
    excerpt.textContent = article.excerpt;

    content.append(metadata, title, excerpt);
    if (article.featured) {
        const link = document.createElement("a");
        link.href = "contact.html";
        link.textContent = `${article.linkText} →`;
        content.append(link);
    }
    card.append(image, content);
    return card;
}

if (featuredArticles && moreArticles) {
    const articlesNote = document.getElementById("articlesNote");

    fetch("/api/articles")
        .then(async response => {
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Unable to load articles.");
            }
            if (!Array.isArray(result.articles)) {
                throw new Error("The articles response is invalid.");
            }
            return result.articles;
        })
        .then(articles => {
            featuredArticles.replaceChildren(
                ...articles.filter(article => article.featured).map(createArticleCard)
            );
            moreArticles.replaceChildren(
                ...articles.filter(article => !article.featured).map(createArticleCard)
            );
        })
        .catch(() => {
            if (articlesNote) {
                articlesNote.hidden = false;
                articlesNote.textContent =
                    "Articles could not be refreshed. Showing the saved articles instead.";
            }
        });
}

/* NEWSLETTER SUBSCRIPTION */

const newsletterForm =
    document.getElementById("newsletterForm");

if (newsletterForm) {

    newsletterForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("newsletterEmail");
        const note = document.getElementById("newsletterNote");
        const button = newsletterForm.querySelector('button[type="submit"]');
        const buttonText = button.textContent;

        note.textContent = "";
        button.disabled = true;
        button.textContent = "Subscribing...";

        try {
            const response = await fetch("/api/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email.value })
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Subscription failed. Please try again.");
            }

            window.location.href = "thank-you.html";
        } catch (error) {
            note.textContent = error instanceof Error
                ? error.message
                : "Subscription failed. Please try again.";
        } finally {
            button.disabled = false;
            button.textContent = buttonText;
        }
    });

}