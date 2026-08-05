# PDF Extraction Infrastructure Requirements

## pdftotext Dependency Missing
The system relies on the `spatie/pdf-to-text` Laravel package, which underneath relies on the `pdftotext` system binary to extract text from PDF documents for AI vectorization. This binary was not found on your Windows path.

## Installation Steps (Windows)

1. **Download Poppler**: Download the latest Poppler for Windows binaries (e.g., from [poppler-windows](https://github.com/oschwartz10612/poppler-windows/releases)).
2. **Extract**: Extract the downloaded ZIP file to a permanent location, such as `C:\Program Files\poppler`.
3. **Add to PATH**:
   - Open Start Search, type "env" and select "Edit the system environment variables".
   - Click "Environment Variables".
   - Under "System variables" (or User variables), select `Path` and click "Edit".
   - Add the path to the extracted Poppler `bin` directory (e.g., `C:\Program Files\poppler\Library\bin`).
   - Click OK to save all dialogs.
4. **Restart**: Restart any open terminals or processes so they can pick up the new PATH variable.

## Verification
Open a new terminal and run:

```bash
where pdftotext
```

If it correctly prints the path to `pdftotext.exe`, the Laravel backend `ProcessDocumentJob` will now be able to extract text successfully.
