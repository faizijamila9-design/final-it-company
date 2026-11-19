/* =========================================
   HEWAD IT - SERVICES PAGE JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  // FAQ accordion
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(function (item) {

    const question = item.querySelector(".faq-question");

    question.addEventListener("click", function () {

      const isOpen = item.classList.contains("active");

      // Close all FAQ items first
      faqItems.forEach(function (otherItem) {
        otherItem.classList.remove("active");

        const otherQuestion =
          otherItem.querySelector(".faq-question");

        otherQuestion.setAttribute("aria-expanded", "false");
      });

      // Open the selected item if it was previously closed
      if (!isOpen) {
        item.classList.add("active");
        question.setAttribute("aria-expanded", "true");
      }

    });

  });


  // Smooth scrolling for links inside this page
  const sectionLinks = document.querySelectorAll(
    'a[href^="#"]'
  );

  sectionLinks.forEach(function (link) {

    link.addEventListener("click", function (event) {

      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        event.preventDefault();

        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

    });

  });

});