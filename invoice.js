document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector(".modal");
  const newInvoiceBtn = document.querySelector(".btn-primary");
  const dropdown = document.querySelector(".dropdown");
  const filter = document.querySelector(".filter");
  const discard = document.querySelector(".btn-discard");
  const addNewItemBtn = document.querySelector(".btn-secondary");
  const newItem = document.querySelector(".new-item");
  const invoiceForm = document.querySelector(".invoice-form");
  const submitBtnSend = document.querySelector(".btn-send");
  const submitBtnDraft = document.querySelector(".btn-draft");
  const invoiceContainer = document.querySelector(".centered-box");
  const addItemBtn = document.getElementById("add-item-btn");
  const saveDraftBtn = document.getElementById("save-draft-btn");
  const saveSendBtn = document.getElementById("save-send-btn");
  const discardBtn = document.getElementById("discard-btn");
  const itemsContainer = document.querySelector(".items-container");
  const sunIcon = document.querySelector(".sun-icon");
  const moonIcon = document.querySelector(".moon-icon");

  let isDropdownOpen = false;
  let submitStatus = "Sent";
  let newInvoiceArrays =
    JSON.parse(localStorage.getItem("newInvoiceArrays")) || [];

  // Initial UI state
  if (newItem) newItem.style.display = "none";
  if (modal) modal.style.display = "none";
  if (dropdown) dropdown.style.display = "none";
  if (sunIcon) sunIcon.style.display = "none";

  // Modal open/close
  newInvoiceBtn?.addEventListener("click", () => {
    modal.style.display = "block";
  });

  discard?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  discardBtn?.addEventListener("click", () => {
    window.location.reload();
  });

  // Dropdown logic
  filter?.addEventListener("mouseenter", () => {
    dropdown.style.display = "block";
    isDropdownOpen = true;
  });

  filter?.addEventListener("click", (event) => {
    event.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
    dropdown.style.display = isDropdownOpen ? "block" : "none";
  });

  document.addEventListener("click", (event) => {
    if (
      isDropdownOpen &&
      !filter.contains(event.target) &&
      !dropdown.contains(event.target)
    ) {
      dropdown.style.display = "none";
      isDropdownOpen = false;
    }
  });

  function applyTheme(theme) {
    const body = document.body;
    const main = document.querySelector(".main");
    const left = document.querySelector(".left");
    const modalContent = document.querySelector(".modal-content");
    const right = document.querySelector(".right");

    body.classList.remove("dark");
    main?.classList.remove("dark");
    left?.classList.remove("dark");
    modalContent?.classList.remove("dark");
    right?.classList.remove("dark");

    if (theme === "dark") {
      body.classList.add("dark");
      main?.classList.add("dark");
      left?.classList.add("dark");
      modalContent?.classList.add("dark");
      right?.classList.add("dark");
    }
  }

  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);

  // Moon icon toggles theme
  moonIcon?.addEventListener("click", () => {
    const currentTheme = localStorage.getItem("theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  });
  sunIcon?.addEventListener("click", () => {
    const currentTheme = localStorage.getItem("theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  });

  // Show new item section
  addNewItemBtn?.addEventListener("click", () => {
    newItem.style.display = "block";
  });

  // Add dynamic item
  addItemBtn?.addEventListener("click", () => {
    const newItemHTML = `
      <div class="new-item-details">
        <div class="client-details">
          <label class="label-secondary">Item Name</label>
          <input class="input-four item-name" type="text" />
        </div>
        <div class="client-details">
          <label class="label-secondary">Qty</label>
          <input class="input-five item-qty" type="number" value="0" />
        </div>
        <div class="client-details">
          <label class="label-secondary">Price</label>
          <input class="input-five item-price" type="number" value="0" />
        </div>
        <div class="client-details">
          <label class="label-secondary">Total</label>
          <input class="input-five item-total" type="text" value="0.00" readonly />
        </div>
        <div>
          <button class="delete-item-btn">🗑</button>
        </div>
      </div>
    `;

    const temp = document.createElement("div");
    temp.innerHTML = newItemHTML;
    const newItemElement = temp.firstElementChild;

    const qtyInput = newItemElement.querySelector(".item-qty");
    const priceInput = newItemElement.querySelector(".item-price");
    const totalInput = newItemElement.querySelector(".item-total");

    const updateTotal = () => {
      const qty = parseFloat(qtyInput.value) || 0;
      const price = parseFloat(priceInput.value) || 0;
      totalInput.value = (qty * price).toFixed(2);
    };

    qtyInput.addEventListener("input", updateTotal);
    priceInput.addEventListener("input", updateTotal);

    newItemElement
      .querySelector(".delete-item-btn")
      .addEventListener("click", () => {
        newItemElement.remove();
      });

    itemsContainer.appendChild(newItemElement);
  });

  // Status buttons
  submitBtnSend?.addEventListener("click", () => {
    submitStatus = "Sent";
    invoiceForm.requestSubmit();
  });

  submitBtnDraft?.addEventListener("click", () => {
    submitStatus = "Draft";
    invoiceForm.requestSubmit();
  });

  // Save buttons with reset
  saveDraftBtn?.addEventListener("click", () => {
    submitStatus = "Draft";
    invoiceForm.requestSubmit();
  });

  saveSendBtn?.addEventListener("click", () => {
    submitStatus = "Sent";
    invoiceForm.requestSubmit();
  });

  // Form submit logic
  invoiceForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    // Helper to show error under a field
    function showError(inputId, message) {
      const input = document.getElementById(inputId);
      if (!input) return;
      let error = input.parentElement.querySelector(".field-error");
      if (!error) {
        error = document.createElement("div");
        error.className = "field-error";
        error.style.color = "red";
        error.style.fontSize = "12px";
        error.style.marginTop = "2px";
        input.parentElement.appendChild(error);
      }
      error.textContent = message;
    }
    // Helper to clear all errors
    function clearErrors() {
      invoiceForm.querySelectorAll(".field-error").forEach((e) => e.remove());
    }

    clearErrors();

    // Collect data from the modal form
    const street = document
      .getElementById("primary-street-address")
      ?.value.trim();
    const city = document.getElementById("primary-city")?.value.trim();
    const postCode = document.getElementById("primary-post_code")?.value.trim();
    const country = document.getElementById("primary-country")?.value.trim();
    const clientName = document.getElementById("client-name")?.value.trim();
    const clientEmail = document.getElementById("client-email")?.value.trim();
    const secStreet = document
      .getElementById("secondary-street-address")
      ?.value?.trim();
    const secCity = document.getElementById("secondary-city")?.value?.trim();
    const secPostCode = document
      .getElementById("secondary-post_code")
      ?.value?.trim();
    const secCountry = document
      .getElementById("secondary-country")
      ?.value?.trim();
    const projectDescription = document
      .getElementById("project-description")
      ?.value.trim();

    let valid = true;

    if (!city) {
      showError("primary-city", "This field is required");
      valid = false;
    }
    if (!postCode) {
      showError("primary-post_code", "This field is required");
      valid = false;
    }
    if (!country) {
      showError("primary-country", "This field is required");
      valid = false;
    }
    if (!street) {
      showError("primary-street-address", "This field is required");
      valid = false;
    }
    if (!clientName) {
      showError("client-name", "This field is required");
      valid = false;
    }
    if (!clientEmail) {
      showError("client-email", "This field is required");
      valid = false;
    }
    if (!secStreet) {
      showError("secondary-street-address", "This field is required");
      valid = false;
    }
    if (!secCity) {
      showError("secondary-city", "This field is required");
      valid = false;
    }
    if (!secPostCode) {
      showError("secondary-post_code", "This field is required");
      valid = false;
    }
    if (!secCountry) {
      showError("secondary-country", "This field is required");
      valid = false;
    }
    if (!projectDescription) {
      showError("project-description", "This field is required");
      valid = false;
    }

    if (!valid) return;

    // Create a new invoice element
    const invoiceDiv = document.createElement("div");
    invoiceDiv.className = "box";
    invoiceDiv.innerHTML = `
      <div class="box-left">
        <h3>${clientName}</h3>
        <p>${street}, ${city}, ${postCode}, ${country}</p>
        <p>${clientEmail}</p>
        <p>${secStreet}, ${secCity}, ${secPostCode}, ${secCountry}</p>
        <p>${projectDescription}</p>
        <p>Status: ${submitStatus}</p>
      </div>
    `;

    // Add the new invoice to the centered-box
    invoiceContainer?.appendChild(invoiceDiv);

    // Close modal and reset form
    modal.style.display = "none";
    invoiceForm.reset();
  });

  // Render invoices
  function generateInvoice(data) {
    invoiceContainer.innerHTML = data
      .map((invoice) => {
        return `
          <div class="box">
            <div class="box-left">
              <h3>#INV-${invoice.invoiceId}</h3>
              <p>${invoice.invoiceDate}</p>
              <p>${invoice.clientName}</p>
            </div>
            <div class="box-right">
              <h3>$${invoice.totalPriceQuantity.toFixed(2)}</h3>
              <div class="status">
                <h4 class="status-${invoice.status.toLowerCase()}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="8" />
                  </svg>
                  ${invoice.status}
                </h4>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // On page load, display saved invoices
  if (newInvoiceArrays.length > 0) {
    generateInvoice(newInvoiceArrays);
  }
});
