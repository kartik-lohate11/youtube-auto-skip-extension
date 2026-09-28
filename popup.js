document
    .getElementById("toggleButton")
    .addEventListener("click", () => {

        const status = document.getElementById("status");

        if (status.textContent === "Extension is active") {
            status.textContent = "Extension disabled";
        } else {
            status.textContent = "Extension is active";
        }

    });