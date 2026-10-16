export {};
const form = (document.getElementById("estimate-form") as HTMLFormElement);
const statusEl = (document.getElementById("form-status") as HTMLElement);
const submitBtn = (document.getElementById("submitBtn") as HTMLButtonElement);
const fileInput = (document.getElementById("photos") as HTMLInputElement);
const fileMeta = (document.getElementById("fileMeta") as HTMLElement);

const fields = {
  fullName: (document.getElementById("fullName") as HTMLInputElement),
  email: (document.getElementById("email") as HTMLInputElement),
  phone: (document.getElementById("phone") as HTMLInputElement),
  contactMethod: () => document.querySelector<HTMLInputElement>("input[name=contactMethod]:checked")!,
  serviceType: (document.getElementById("serviceType") as HTMLInputElement),
  notes: (document.getElementById("notes") as HTMLInputElement),
  street: (document.getElementById("street") as HTMLInputElement),
  city: (document.getElementById("city") as HTMLInputElement),
  state: (document.getElementById("state") as HTMLInputElement),
  zip: (document.getElementById("zip") as HTMLInputElement),
  propertyConfirm: (document.getElementById("propertyConfirm") as HTMLInputElement)
};

const errorEls = {
  fullName: (document.getElementById("error-fullName") as HTMLElement),
  email: (document.getElementById("error-email") as HTMLElement),
  phone: (document.getElementById("error-phone") as HTMLElement),
  contactMethod: (document.getElementById("error-contactMethod") as HTMLElement),
  serviceType: (document.getElementById("error-serviceType") as HTMLElement),
  notes: (document.getElementById("error-notes") as HTMLElement),
  street: (document.getElementById("error-street") as HTMLElement),
  city: (document.getElementById("error-city") as HTMLElement),
  state: (document.getElementById("error-state") as HTMLElement),
  zip: (document.getElementById("error-zip") as HTMLElement),
  propertyConfirm: (document.getElementById("error-propertyConfirm") as HTMLElement),
  photos: (document.getElementById("error-photos") as HTMLElement)
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(\+1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/;
const zipPattern = /^\d{5}$/;

const clearStatus = () => {
  statusEl.textContent = "";
  statusEl.className = "form-status";
};

const setStatus = (message: string, type: "success" | "error") => {
  statusEl.textContent = message;
  statusEl.className = `form-status ${type}`;
};

const setError = (key: keyof typeof errorEls, message: string) => {
  if (errorEls[key]) {
    errorEls[key].textContent = message;
  }
  const input = key in fields ? fields[key as keyof typeof fields] : null;
  if (input instanceof HTMLElement) {
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

const formatFiles = (files: FileList | null) => {
  if (!files || files.length === 0) {
    return "No files selected";
  }
  const names = Array.from(files).map((file) => file.name);
  const total = files.length;
  return `${total} file${total > 1 ? "s" : ""} selected: ${names.join(", ")}`;
};

fileInput.addEventListener("change", () => {
  fileMeta.textContent = formatFiles(fileInput.files);
});


let requestKey = sessionStorage.getItem("ntc-request-key") || crypto.randomUUID();
sessionStorage.setItem("ntc-request-key", requestKey);
async function preparePhoto(file: File) {
  if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 20 * 1024 * 1024) throw new Error("Choose JPG, PNG, or WebP photos smaller than 20 MB each.");
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1,Math.round(bitmap.width * scale)); canvas.height = Math.max(1,Math.round(bitmap.height * scale));
  canvas.getContext("2d")!.drawImage(bitmap,0,0,canvas.width,canvas.height); bitmap.close();
  let data = canvas.toDataURL("image/jpeg",.8).split(",")[1];
  if (data.length > 1250000) data = canvas.toDataURL("image/jpeg",.55).split(",")[1];
  if (data.length > 1250000) throw new Error("This photograph is too large. Please choose a smaller image.");
  return {name:file.name,type:"image/jpeg",data};
}
form.addEventListener("submit", async (event) => {
  event.preventDefault(); clearStatus();
  if (!validate()) { setStatus("Please fix the highlighted fields.","error"); form.querySelector<HTMLElement>(".error")?.focus(); return; }
  if (!fields.street.value.trim() || !fields.city.value.trim() || !fields.state.value) {setStatus("Add the street, city, and state where the work is needed.","error");fields.street.focus();return;}
  if (fileInput.files!.length > 4) {setStatus("Choose up to four photographs.","error");return;}
  submitBtn.disabled=true;submitBtn.textContent="Saving request…";
  try {
    const photos = await Promise.all(Array.from(fileInput.files!).map(preparePhoto));
    const response = await fetch("https://www.n3xra.com/api/service-jobs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      slug:"nichols-tree-care", request_key:requestKey, website_url:(document.getElementById("website_url") as HTMLInputElement).value,
      name:fields.fullName.value.trim(), company:(document.getElementById("company") as HTMLInputElement).value.trim(), email:fields.email.value.trim(), phone:fields.phone.value.trim(), contact_method:fields.contactMethod().value, service_type:fields.serviceType.value, description:fields.notes.value.trim(),
      address:[fields.street.value.trim(),fields.city.value.trim(),fields.state.value,fields.zip.value.trim()].filter(Boolean).join(", "),
      primary_address:(document.getElementById("primaryAddress") as HTMLInputElement).value.trim(), property_confirmed:fields.propertyConfirm.checked, photos
    })});
    const result=await response.json();
    if (!response.ok || !result.accepted) throw new Error(result.error||"Your request could not be saved. Please try again.");
    form.reset();fileMeta.textContent="No files selected";
    setStatus(`Request saved. Your reference is ${result.reference}. Nichols Tree Care will follow up using your preferred contact method.`,"success");
    requestKey=crypto.randomUUID();sessionStorage.setItem("ntc-request-key",requestKey);statusEl.scrollIntoView({behavior:"smooth",block:"center"});
  } catch(error: unknown) {setStatus((error instanceof Error ? error.message : "")||"Your request could not be saved. Please try again, or call (541) 880-8874.","error");}
  finally {submitBtn.disabled=false;submitBtn.textContent="Submit Estimate Request";}
});
