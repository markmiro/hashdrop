export function resetFileInput(fileInputEl: HTMLInputElement) {
  if (!fileInputEl) return;
  fileInputEl.type = "text";
  fileInputEl.type = "file";
  fileInputEl.setAttribute("value", "");
}
