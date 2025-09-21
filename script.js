// AccessAble Solutions - Main JavaScript
// Accessibility-focused interactions

document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation toggle
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isExpanded = nav.classList.contains("active");
      nav.classList.toggle("active");

      // Update ARIA attributes for accessibility
      navToggle.setAttribute("aria-expanded", !isExpanded);
      navToggle.textContent = isExpanded ? "☰ Menu" : "✕ Close";
    });

    // Close mobile menu when clicking on a link
    const navLinks = nav.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.textContent = "☰ Menu";
      });
    });
  }

  // Set active navigation link
  setActiveNavLink();

  // Form handling
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmit);
    setupFormValidation(contactForm);
  }

  // Newsletter form handling
  const newsletterForms = document.querySelectorAll(".newsletter-form");
  newsletterForms.forEach((form) => {
    form.addEventListener("submit", handleNewsletterSubmit);
  });

  // Keyboard navigation improvements
  enhanceKeyboardNavigation();

  setupSmoothScrolling();

  setupFormReset();
});

function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const messageContainer = document.getElementById("form-message");

  // Clear previous errors
  clearFormErrors(form);

  // Comprehensive form validation
  const validationResult = validateContactForm(formData, form);

  if (!validationResult.isValid) {
    showFormErrors(validationResult.errors, form);
    // Focus on first error field for accessibility
    const firstErrorField = form.querySelector(".error");
    if (firstErrorField) {
      firstErrorField.focus();
    }
    return;
  }

  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Sending...";
  submitButton.disabled = true;

  // Simulate form submission (in real implementation, this would send to a server)
  setTimeout(() => {
    showMessage(
      "Thank you for your message! We will get back to you within 24 hours.",
      "success"
    );
    form.reset();
    clearFormErrors(form);

    // Reset button state
    submitButton.textContent = originalText;
    submitButton.disabled = false;

    // Focus management for accessibility
    messageContainer.focus();

    // Announce success to screen readers
    announceToScreenReader(
      "Form submitted successfully. Thank you for your message."
    );
  }, 1500);
}

function handleNewsletterSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const email = formData.get("email").trim();

  if (!email || !isValidEmail(email)) {
    showMessage(
      "Please enter a valid email address, e.g abc@domain.com",
      "error"
    );
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Subscribing...";
  submitButton.disabled = true;

  // Simulate subscription
  setTimeout(() => {
    showMessage(
      "Thank you for subscribing! You'll receive our next newsletter soon.",
      "success"
    );
    form.reset();

    submitButton.textContent = originalText;
    submitButton.disabled = false;

    announceToScreenReader("Successfully subscribed to newsletter.");
  }, 1000);
}

function validateContactForm(formData, form) {
  const errors = [];
  const firstName = formData.get("firstName").trim();
  const lastName = formData.get("lastName").trim();
  const email = formData.get("email").trim();
  const message = formData.get("message").trim();
  const serviceTypes = formData.getAll("serviceType");

  // Required field validation
  if (!firstName) {
    errors.push({ field: "first-name", message: "First name is required." });
  }

  if (!lastName) {
    errors.push({ field: "last-name", message: "Last name is required." });
  }

  if (!email) {
    errors.push({ field: "email", message: "Email address is required." });
  } else if (!isValidEmail(email)) {
    errors.push({
      field: "email",
      message: "Please enter a valid email address, e.g abc@domain.com",
    });
  }

  if (!message) {
    errors.push({
      field: "message",
      message: "Please tell us about your project.",
    });
  } else if (message.length < 10) {
    errors.push({
      field: "message",
      message:
        "Please provide more details about your project (at least 10 characters).",
    });
  }

  if (serviceTypes.length === 0) {
    errors.push({
      field: "service-type",
      message: "Please select at least one service type.",
    });
  }

  // Phone validation (if provided)
  const phone = formData.get("phone").trim();
  if (phone && !isValidPhone(phone)) {
    errors.push({
      field: "phone",
      message: "Please enter a valid phone number.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

function setupFormValidation(form) {
  const fields = form.querySelectorAll("input, textarea, select");

  fields.forEach((field) => {
    // Validate on blur for better UX
    field.addEventListener("blur", () => {
      validateField(field);
    });

    // Clear errors on input
    field.addEventListener("input", () => {
      clearFieldError(field);
    });
  });

  // Special handling for checkboxes
  const checkboxes = form.querySelectorAll('input[name="serviceType"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const checkedBoxes = form.querySelectorAll(
        'input[name="serviceType"]:checked'
      );
      if (checkedBoxes.length > 0) {
        clearFieldError(document.getElementById("service-type-error"));
      }
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  let errorMessage = "";

  switch (fieldName) {
    case "firstName":
    case "lastName":
      if (!value) {
        errorMessage = `${
          fieldName === "firstName" ? "First" : "Last"
        } name is required.`;
      }
      break;

    case "email":
      if (!value) {
        errorMessage = "Email address is required.";
      } else if (!isValidEmail(value)) {
        errorMessage = "Please enter a valid email address, e.g abc@domain.com";
      }
      break;

    case "phone":
      if (value && !isValidPhone(value)) {
        errorMessage = "Please enter a valid phone number.";
      }
      break;

    case "message":
      if (!value) {
        errorMessage = "Please tell us about your project.";
      } else if (value.length < 10) {
        errorMessage = "Please provide more details (at least 10 characters).";
      }
      break;
  }

  if (errorMessage) {
    showFieldError(field, errorMessage);
  } else {
    clearFieldError(field);
  }
}

function showFieldError(field, message) {
  const errorElement = document.getElementById(`${field.id}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    field.classList.add("error");
    field.setAttribute("aria-invalid", "true");
  }
}

function clearFieldError(field) {
  if (field.id) {
    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
      errorElement.textContent = "";
    }
  }
  if (field.classList) {
    field.classList.remove("error");
    field.removeAttribute("aria-invalid");
  }
}

function showFormErrors(errors, form) {
  errors.forEach((error) => {
    const field = document.getElementById(error.field);
    if (field) {
      showFieldError(field, error.message);
    } else if (error.field === "service-type") {
      const errorElement = document.getElementById("service-type-error");
      if (errorElement) {
        errorElement.textContent = error.message;
      }
    }
  });
}

function clearFormErrors(form) {
  const errorElements = form.querySelectorAll(".error-message");
  errorElements.forEach((element) => {
    element.textContent = "";
  });

  const errorFields = form.querySelectorAll(".error");
  errorFields.forEach((field) => {
    field.classList.remove("error");
    field.removeAttribute("aria-invalid");
  });
}

function showMessage(text, type) {
  const messageContainer = document.getElementById("form-message");
  if (!messageContainer) return;

  messageContainer.innerHTML = `
        <div class="message message-${type}" role="alert" tabindex="-1">
            ${text}
        </div>
    `;

  // Announce to screen readers
  messageContainer.querySelector(".message").focus();
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-$$$$.]/g, "");
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
}

function setupSmoothScrolling() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (href === "#" || href.length <= 1) return;

      const targetElement = document.querySelector(href);
      if (targetElement) {
        event.preventDefault();

        // Smooth scroll with accessibility considerations
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Focus management for keyboard users
        setTimeout(() => {
          targetElement.focus();
        }, 500);
      }
    });
  });
}

function setupFormReset() {
  const resetButtons = document.querySelectorAll('button[type="reset"]');

  resetButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const form = button.closest("form");
      if (form) {
        // Clear all errors when resetting
        setTimeout(() => {
          clearFormErrors(form);
          announceToScreenReader("Form has been reset.");
        }, 10);
      }
    });
  });
}

function enhanceKeyboardNavigation() {
  // Ensure all interactive elements are keyboard accessible
  const interactiveElements = document.querySelectorAll(
    "a, button, input, textarea, select"
  );

  interactiveElements.forEach((element) => {
    // Add focus indicators for elements that might not have them
    if (
      !element.hasAttribute("tabindex") &&
      element.tagName !== "INPUT" &&
      element.tagName !== "TEXTAREA"
    ) {
      element.setAttribute("tabindex", "0");
    }
  });

  // Handle escape key to close mobile menu
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const nav = document.querySelector("nav");
      const navToggle = document.querySelector(".nav-toggle");

      if (nav && nav.classList.contains("active")) {
        nav.classList.remove("active");
        if (navToggle) {
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.textContent = "☰ Menu";
          navToggle.focus();
        }
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.classList.contains("clickable")) {
      event.target.click();
    }
  });
}

// Utility function to announce content changes to screen readers
function announceToScreenReader(message) {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Focus trap for modal-like interactions
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  element.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      if (event.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          event.preventDefault();
        }
      }
    }
  });
}

// Debounce function for performance optimization
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const performanceMonitor = {
  startTime: null,
  endTime: null,

  start() {
    this.startTime = performance.now();
  },

  end(action) {
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;
    console.log(`[v0] ${action} completed in ${duration.toFixed(2)}ms`);
  },
};

// Enhanced error handling with user-friendly messages
window.addEventListener("error", (event) => {
  console.error("[v0] JavaScript error:", event.error);
  // In production, you might want to send this to an error tracking service
});

function announceContentChange(message, priority = "polite") {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 2000);
}

// Export functions for potential testing or external use
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    isValidEmail,
    isValidPhone,
    validateContactForm,
    announceToScreenReader,
    debounce,
  };
}
