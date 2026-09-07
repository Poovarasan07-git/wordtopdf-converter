```javascript
// Get HTML elements

const wordFile = document.getElementById("word-file");
const fileName = document.getElementById("file-name");
const convertButton = document.getElementById("convert-button");
const message = document.getElementById("message");


// Show selected file name

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


// Convert Word to PDF

convertButton.addEventListener("click", async function () {

    // Check if file is selected

    if (wordFile.files.length === 0) {

        message.textContent = "Please select a Word file first.";

        return;
    }


    // Get selected file

    const selectedFile = wordFile.files[0];


    // Check file type

    if (
        !selectedFile.name.toLowerCase().endsWith(".doc") &&
        !selectedFile.name.toLowerCase().endsWith(".docx")
    ) {

        message.textContent = "Please select a valid Word document.";

        return;
    }


    // Create FormData

    const formData = new FormData();

    formData.append("file", selectedFile);


    // Show converting message

    message.textContent = "Converting... Please wait.";

    convertButton.disabled = true;


    try {

        // Send file to Render FastAPI backend

        const response = await fetch(
            "https://wordtopdf-converter-69kw.onrender.com/convert",
            {
                method: "POST",
                body: formData
            }
        );


        // Check response

        if (!response.ok) {

            const error = await response.json();

            throw new Error(
                error.detail || "Conversion failed."
            );
        }


        // Get PDF from response

        const pdfBlob = await response.blob();


        // Create download URL

        const downloadURL = URL.createObjectURL(pdfBlob);


        // Create temporary download link

        const downloadLink = document.createElement("a");

        downloadLink.href = downloadURL;

        downloadLink.download =
            selectedFile.name.replace(/\.(doc|docx)$/i, "") + ".pdf";


        // Start download

        downloadLink.click();


        // Clean up

        URL.revokeObjectURL(downloadURL);


        // Success message

        message.textContent =
            "Conversion successful! PDF downloaded.";


    } catch (error) {

        console.error(error);

        message.textContent =
            "Something went wrong. Please try again.";

    }


    // Enable button again

    convertButton.disabled = false;

});
```
