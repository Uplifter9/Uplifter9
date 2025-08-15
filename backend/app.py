import os
import uuid
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

# PDF and Image processing
from PIL import Image
from pdf2image import convert_from_path
from PyPDF2 import PdfWriter, PdfReader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

app = Flask(__name__)
CORS(app)

# --- Configuration ---
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
GENERATED_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'generated')
DAVID_FONT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'DavidLibre-Regular.ttf')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['GENERATED_FOLDER'] = GENERATED_FOLDER

# --- Setup ---
# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['GENERATED_FOLDER'], exist_ok=True)

# Register the Hebrew font with reportlab
pdfmetrics.registerFont(TTFont('DavidLibre', DAVID_FONT_PATH))


def create_appendix_page(input_path, title_text, font_size):
    """
    Creates a new A4 PDF page with a title and the content of the input file (image or PDF page).
    Returns the path to the newly created PDF page.
    """
    output_filename = f"{uuid.uuid4()}.pdf"
    output_path = os.path.join(app.config['GENERATED_FOLDER'], output_filename)

    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4  # Page dimensions

    # --- Draw Title ---
    c.setFont('DavidLibre', font_size)
    c.drawRightString(width - 50, height - 70, title_text)

    # --- Draw Content (Image) ---
    # We use Pillow to open the image, which can be the original image or a converted PDF page
    img = Image.open(input_path)
    img_width, img_height = img.size

    # Calculate scaling factor to fit the page, preserving aspect ratio
    margin = 50
    available_width = width - 2 * margin
    available_height = height - 120 # Extra space for title

    scale = min(available_width / img_width, available_height / img_height)

    new_width = img_width * scale
    new_height = img_height * scale

    # Center the image on the page
    x_pos = (width - new_width) / 2
    y_pos = (available_height - new_height) / 2 + margin

    c.drawImage(input_path, x_pos, y_pos, width=new_width, height=new_height)

    c.save()
    return output_path


@app.route('/api/generate', methods=['POST'])
def generate_pdf():
    data = request.get_json()
    files_data = data.get('files', [])
    font_size = int(data.get('fontSize', 48))

    if not files_data:
        return jsonify({'error': 'No files provided'}), 400

    generated_pages = []
    temp_image_files = []

    try:
        for item in files_data:
            original_filename = secure_filename(item['name'])
            title = item['title']
            input_path = os.path.join(app.config['UPLOAD_FOLDER'], original_filename)

            if not os.path.exists(input_path):
                continue

            file_ext = os.path.splitext(original_filename)[1].lower()

            if file_ext in ['.png', '.jpg', '.jpeg']:
                page_pdf = create_appendix_page(input_path, title, font_size)
                generated_pages.append(page_pdf)

            elif file_ext == '.pdf':
                # Convert each page of the PDF to an image
                images = convert_from_path(input_path)
                for i, image in enumerate(images):
                    temp_img_path = os.path.join(app.config['GENERATED_FOLDER'], f"{uuid.uuid4()}.png")
                    image.save(temp_img_path, 'PNG')
                    temp_image_files.append(temp_img_path)

                    # Create a new title for multi-page PDFs
                    page_title = f"{title} (עמוד {i+1})"
                    page_pdf = create_appendix_page(temp_img_path, page_title, font_size)
                    generated_pages.append(page_pdf)

        if not generated_pages:
            return jsonify({'error': 'Could not process any of the files'}), 500

        # --- Merge all generated pages into a single PDF ---
        merger = PdfWriter()
        for pdf_path in generated_pages:
            merger.append(pdf_path)

        final_pdf_name = f"נספחים_{uuid.uuid4()}.pdf"
        final_pdf_path = os.path.join(app.config['GENERATED_FOLDER'], final_pdf_name)
        merger.write(final_pdf_path)
        merger.close()

        return send_file(final_pdf_path, as_attachment=True, download_name='נספחים.pdf')

    finally:
        # --- Cleanup ---
        for path in generated_pages + temp_image_files:
            if os.path.exists(path):
                os.remove(path)
        # We can also clean up the original uploads here if desired
        # for item in files_data:
        #     original_filename = secure_filename(item['name'])
        #     input_path = os.path.join(app.config['UPLOAD_FOLDER'], original_filename)
        #     if os.path.exists(input_path):
        #         os.remove(input_path)


# Keep the upload endpoint for receiving files first
@app.route('/api/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part in the request'}), 400

    files = request.files.getlist('files')

    if not files or files[0].filename == '':
        return jsonify({'error': 'No selected files'}), 400

    saved_files_info = []
    for file in files:
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            saved_files_info.append({'name': filename, 'size': os.path.getsize(filepath)})

    return jsonify({
        'message': 'Files uploaded successfully',
        'files': saved_files_info
    }), 200


if __name__ == '__main__':
    app.run(debug=True, port=5001)
