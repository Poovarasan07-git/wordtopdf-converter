javascript
const wordFile = document.getElementById("word-file");
const fileName = document.getElementById("file-name");
const convertButton = document.getElementById("convert-button");
const message = document.getElementById("message");


// File selection

wordFile.addEventListener("change", function () {

    if (wordFile.files.length > 0) {

        const selectedFile = wordFile.files[0];

        fileName.textContent = selectedFile.name;
        message.textContent = "Word file selected.";

    } else {

        fileName.textContent = "No file selected";
        message.textContent = "";
    }

});


// Word to PDF conversion

convertButton.addEventListener("click", async function () {

    if (wordFile.files.length === 0) {

        message.textContent = "Please select a Word file first.";
        return;
    }

    const selectedFile = wordFile.files[0];

    const fileNameLower = selectedFile.name.toLowerCase();

    if (
        !fileNameLower.endsWith(".doc") &&
        !fileNameLower.endsWith(".docx")
    ) {

        message.textContent = "Please select a valid Word document.";
        return;
    }

    const formData = new FormData();

    formData.append("file", selectedFile);

    message.textContent = "Converting... Please wait.";

    convertButton.disabled = true;

    try {

        const response = await fetch(
            "https://wordtopdf-converter-69kw.onrender.com/convert",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {

            let errorMessage = "Conversion failed.";

            try {

                const error = await response.json();

                if (error.detail) {
                    errorMessage = error.detail;
                }

            } catch (e) {
                // Ignore JSON parsing error
            }

            throw new Error(errorMessage);
        }

        const pdfBlob = await response.blob();

        const downloadURL = URL.createObjectURL(pdfBlob);

        const downloadLink = document.createElement("a");

        downloadLink.href = downloadURL;

        downloadLink.download =
            selectedFile.name.replace(/\.(doc|docx)$/i, "") + ".pdf";

        document.body.appendChild(downloadLink);

        downloadLink.click();

        document.body.removeChild(downloadLink);

        URL.revokeObjectURL(downloadURL);

        message.textContent =
            "Conversion successful! PDF downloaded.";

    } catch (error) {

        console.error("Conversion error:", error);

        message.textContent =
            "Something went wrong. Please try again.";

    }

    convertButton.disabled = false;

});

