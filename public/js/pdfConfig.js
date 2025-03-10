
const pdfSrc = "https://drive.google.com/file/d/1V671ZKsWTom_5BxeEk7TFIKQKW9_WvKA/preview";

document.addEventListener("DOMContentLoaded", function () {
    const iframe = document.getElementById("pdfViewer");
    if (iframe) {
        iframe.src = pdfSrc;
    }
});
