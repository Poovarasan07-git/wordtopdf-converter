from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

import os
import shutil
import subprocess
import tempfile


app = FastAPI()


# ==========================================
# CORS - Allow Frontend to Access Backend
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# LibreOffice
# ==========================================
# Docker runs Linux, so we use the
# LibreOffice command instead of Windows path.

libreoffice_path = "libreoffice"


# ==========================================
# Home Route
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Word to PDF Converter Backend is running"
    }


# ==========================================
# Word to PDF Conversion
# ==========================================

@app.post("/convert")
async def convert_word_to_pdf(
    file: UploadFile = File(...)
):

    # ------------------------------------------
    # Check if file is Word document
    # ------------------------------------------

    if not file.filename.lower().endswith((".doc", ".docx")):

        raise HTTPException(
            status_code=400,
            detail="Please upload a Word document."
        )


    # ------------------------------------------
    # Create temporary folder
    # ------------------------------------------

    temp_folder = tempfile.mkdtemp()


    try:

        # ------------------------------------------
        # Save uploaded Word file
        # ------------------------------------------

        word_path = os.path.join(
            temp_folder,
            file.filename
        )


        with open(word_path, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        # ------------------------------------------
        # Convert Word → PDF using LibreOffice
        # ------------------------------------------

        subprocess.run(
            [
                libreoffice_path,
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                temp_folder,
                word_path
            ],
            check=True
        )


        # ------------------------------------------
        # Create PDF filename
        # ------------------------------------------

        pdf_filename = (
            os.path.splitext(file.filename)[0]
            + ".pdf"
        )


        pdf_path = os.path.join(
            temp_folder,
            pdf_filename
        )


        # ------------------------------------------
        # Check PDF was created
        # ------------------------------------------

        if not os.path.exists(pdf_path):

            raise HTTPException(
                status_code=500,
                detail="PDF conversion failed."
            )


        # ------------------------------------------
        # Send PDF to browser
        # ------------------------------------------

        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=pdf_filename
        )


    except subprocess.CalledProcessError:

        raise HTTPException(
            status_code=500,
            detail="Could not convert the Word document."
        )


    except Exception as e:

        print("Conversion error:", e)

        raise HTTPException(
            status_code=500,
            detail="Something went wrong during conversion."
        )