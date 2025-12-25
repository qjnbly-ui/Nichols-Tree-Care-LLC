const form = document.getElementById("estimate-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submitBtn");
const fileInput = document.getElementById("photos");
const fileMeta = document.getElementById("fileMeta");

const fields = {
  fullName: document.getElementById("fullName"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  contactMethod: () => document.querySelector("input[name=contactMethod]:checked"),
  serviceType: document.getElementById("serviceType"),
  notes: document.getElementById("notes"),
  street: document.getElementById("street"),
  city: document.getElementById("city"),
  state: document.getElementById("state"),
  zip: document.getElementById("zip"),
  propertyConfirm: document.getElementById("propertyConfirm")
};

const errorEls = {
  fullName: document.getElementById("error-fullName"),
  email: document.getElementById("error-email"),
  phone: document.getElementById("error-phone"),
  contactMethod: document.getElementById("error-contactMethod"),
  serviceType: document.getElementById("error-serviceType"),
  notes: document.getElementById("error-notes"),
  street: document.getElementById("error-street"),
  city: document.getElementById("error-city"),
  state: document.getElementById("error-state"),
  zip: document.getElementById("error-zip"),
  propertyConfirm: document.getElementById("error-propertyConfirm"),
  photos: document.getElementById("error-photos")
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(\+1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/;
const zipPattern = /^\d{5}$/;

const clearStatus = () => {
  statusEl.textContent = "";
  statusEl.className = "form-status";
};

const setStatus = (message, type) => {
  statusEl.textContent = message;
  statusEl.className = `form-status ${type}`;
};

const setError = (key, message) => {
  if (errorEls[key]) {
    errorEls[key].textContent = message;
  }
  const input = fields[key];
  if (input && input.classList) {
    if (message) {
      input.classList.add("error");
    } else {
      input.classList.remove("error");
    }
  }
};

const validate = () => {
  let isValid = true;

  setError("fullName", "");
  setError("email", "");
  setError("phone", "");
  setError("contactMethod", "");
  setError("serviceType", "");
  setError("notes", "");
  setError("zip", "");
  setError("propertyConfirm", "");

  if (!fields.fullName.value.trim()) {
    setError("fullName", "Full name is required.");
    isValid = false;
  }

  if (!fields.email.value.trim()) {
    setError("email", "Email is required.");
    isValid = false;
  } else if (!emailPattern.test(fields.email.value.trim())) {
    setError("email", "Enter a valid email address.");
    isValid = false;
  }

  if (!fields.phone.value.trim()) {
    setError("phone", "Phone is required.");
    isValid = false;
  } else if (!phonePattern.test(fields.phone.value.trim())) {
    setError("phone", "Enter a valid US phone number.");
    isValid = false;
  }

  if (!fields.contactMethod()) {
    setError("contactMethod", "Select a contact method.");
    isValid = false;
  }

  if (!fields.serviceType.value) {
    setError("serviceType", "Select a service type.");
    isValid = false;
  }

  if (!fields.notes.value.trim()) {
    setError("notes", "Notes are required.");
    isValid = false;
  } else if (fields.notes.value.trim().length < 10) {
    setError("notes", "Please enter at least 10 characters.");
    isValid = false;
  }

  if (fields.zip.value.trim() && !zipPattern.test(fields.zip.value.trim())) {
    setError("zip", "Enter a 5-digit ZIP code.");
    isValid = false;
  }

  if (!fields.propertyConfirm.checked) {
    setError("propertyConfirm", "You must confirm permission to request work.");
    isValid = false;
  }

  return isValid;
};

const formatFiles = (files) => {
  if (!files || files.length === 0) {
    return "No files selected";
  }
  const names = Array.from(files).map((file) => file.name);
  const total = files.length;
  return `${total} file${total > 1 ? "s" : ""} selected: ${names.join(", ")}`;
};

const buildRequestId = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `EST-${yyyy}${mm}${dd}-${rand}`;
};

fileInput.addEventListener("change", () => {
  fileMeta.textContent = formatFiles(fileInput.files);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearStatus();

  const valid = validate();
  if (!valid) {
    setStatus("Please fix the highlighted fields.", "error");
    return;
  }

  const payload = {
    requestId: buildRequestId(),
    timestamp: new Date().toISOString(),
    fullName: fields.fullName.value.trim(),
    email: fields.email.value.trim(),
    phone: fields.phone.value.trim(),
    contactMethod: fields.contactMethod().value,
    serviceType: fields.serviceType.value,
    notes: fields.notes.value.trim(),
    address: {
      street: fields.street.value.trim(),
      city: fields.city.value.trim(),
      state: fields.state.value,
      zip: fields.zip.value.trim()
    },
    files: Array.from(fileInput.files).map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size
    })),
    propertyConfirmed: fields.propertyConfirm.checked
  };

  console.log("SEND_TO_LUKE", payload);
  console.log("SEND_CONFIRMATION_TO_CUSTOMER", payload);

  setStatus("Request submitted. We'll contact you soon.", "success");
  submitBtn.disabled = true;

  window.setTimeout(() => {
    form.reset();
    fileMeta.textContent = "No files selected";
    submitBtn.disabled = false;
    clearStatus();
  }, 3000);
});
