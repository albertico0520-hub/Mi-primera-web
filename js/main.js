/*
  Harborleaf Cleaning — JavaScript de la demostración
  ---------------------------------------------------
  Este archivo hace tres cosas:
  1. Abre y cierra el menú en pantallas pequeñas.
  2. Escribe el año actual en el pie de página.
  3. Revisa el formulario y muestra una vista previa local.

  No envía datos, no guarda solicitudes y no confirma citas.
  Más adelante, la función mostrarVistaPrevia es el lugar
  donde se conectaría el sistema de reservas real.
*/

(function () {
  const menuButton = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav]");
  const menuLabel = document.querySelector("[data-nav-label]");
  const year = document.querySelector("[data-year]");
  const form = document.querySelector("[data-request-form]");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const dateField = document.querySelector("[data-min-today]");
  if (dateField) {
    dateField.min = new Date().toISOString().slice(0, 10);
  }

  function closeMenu() {
    if (!menu || !menuButton) {
      return;
    }

    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    if (menuLabel) {
      menuLabel.textContent = "Menú";
    }
  }

  if (menu && menuButton) {
    menuButton.addEventListener("click", function () {
      const isOpen = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (menuLabel) {
        menuLabel.textContent = isOpen ? "Cerrar" : "Menú";
      }
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  if (!form) {
    return;
  }

  const preview = form.querySelector("[data-preview]");
  const previewMessage = form.querySelector("[data-preview-message]");
  const previewList = form.querySelector("[data-preview-list]");

  const fields = [
    ["fullName", "Escribe un nombre. Puede ser inventado."],
    ["email", "Escribe un correo con formato válido, por ejemplo ana@correo.example."],
    ["phone", "Escribe un teléfono de al menos 10 dígitos. Puedes usar un número 555."],
    ["service", "Elige un tipo de servicio de ejemplo."],
    ["city", "Escribe una ciudad. Puede ser ficticia."],
    ["demoAck", "Marca la casilla para continuar la demostración."]
  ];

  function fieldError(field) {
    return document.getElementById(field.id + "-error");
  }

  function clearError(field) {
    const error = fieldError(field);
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
    if (error) {
      error.hidden = true;
      error.textContent = "";
    }
  }

  function showError(field, message) {
    const error = fieldError(field);
    field.setAttribute("aria-invalid", "true");
    if (error) {
      field.setAttribute("aria-describedby", error.id);
      error.hidden = false;
      error.textContent = message;
    }
  }

  function digitsOnly(value) {
    return value.replace(/\D/g, "");
  }

  function isValid(field) {
    const value = field.type === "checkbox" ? field.checked : field.value.trim();

    if (field.name === "fullName") {
      return value.length >= 2;
    }

    if (field.name === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (field.name === "phone") {
      return digitsOnly(value).length >= 10;
    }

    if (field.name === "demoAck") {
      return field.checked;
    }

    return value !== "";
  }

  function selectedText(field) {
    if (field.tagName !== "SELECT") {
      return field.value.trim();
    }

    const option = field.options[field.selectedIndex];
    return option ? option.text : "";
  }

  function addPreviewRow(label, value) {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    row.append(term, description);
    previewList.append(row);
  }

  function showPreview() {
    const visibleFields = [
      ["Nombre", "fullName"],
      ["Correo", "email"],
      ["Teléfono", "phone"],
      ["Servicio", "service"],
      ["Ciudad", "city"],
      ["Fecha preferida", "preferredDate"],
      ["Horario", "timeWindow"],
      ["Notas", "notes"]
    ];

    previewList.replaceChildren();

    visibleFields.forEach(function (item) {
      const field = form.elements[item[1]];
      const value = selectedText(field);
      if (value) {
        addPreviewRow(item[0], value);
      }
    });

    previewMessage.textContent = "Estos datos solo se muestran en esta página. No se enviaron, no se guardaron y no reservan una cita.";
    preview.hidden = false;
    preview.scrollIntoView({ block: "nearest" });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let firstInvalidField = null;

    fields.forEach(function (item) {
      const field = form.elements[item[0]];
      clearError(field);

      if (!isValid(field)) {
        showError(field, item[1]);
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    });

    const date = form.elements.preferredDate;
    clearError(date);
    if (date.value && date.min && date.value < date.min) {
      showError(date, "La fecha de ejemplo no puede ser anterior a hoy.");
      if (!firstInvalidField) {
        firstInvalidField = date;
      }
    }

    if (firstInvalidField) {
      preview.hidden = true;
      firstInvalidField.focus();
      return;
    }

    showPreview();
  });

  form.addEventListener("input", function (event) {
    if (event.target && event.target.matches("input, select, textarea")) {
      clearError(event.target);
    }
  });
})();
