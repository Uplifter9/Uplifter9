# app.py
# -*- coding: utf-8 -*-
"""
אפליקציית Streamlit מלאה ליצירת חוברת נספחים בעברית (A4):
- העלאת קבצי PDF/תמונות באצווה
- עימוד עמודי A4 עם כותרת "נספח X׳" בעברית, RTL תקין
- בחירת גופן: חיפוש גופנים מותקנים, העלאת TTF, או טעינת David Libre אוטומטית
- שליטה בגודל הגופן (4–168pt), שוליים ומרווח כותרת
- מצב PDF: עמוד ראשון בלבד או כל העמודים
- יצוא: PDF מאוחד, DOCX (Word), ZIP של נספחים בודדים + הורדה פרטנית לכל נספח
- תמיכה בכותרות מותאמות ידנית לכל קובץ

הרצה מקומית:
1) pip install -r requirements.txt
2) streamlit run app.py

פריסה חינמית: Streamlit Community Cloud / Hugging Face Spaces (ראו README).
"""

import io
import os
import zipfile
from dataclasses import dataclass
from typing import List, Tuple, Optional, Dict

import streamlit as st
from PIL import Image, ImageDraw, ImageFont, ImageOps, UnidentifiedImageError
import fitz  # PyMuPDF
from bidi.algorithm import get_display
from matplotlib import font_manager
from docx import Document
from docx.shared import Mm, Pt
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import requests

# =========================
# קבועים והגדרות דף
# =========================
DPI = 300
A4_WIDTH_INCH = 8.27
A4_HEIGHT_INCH = 11.69
A4_W = int(A4_WIDTH_INCH * DPI)   # ~2480
A4_H = int(A4_HEIGHT_INCH * DPI)  # ~3508
DEFAULT_FONT_SIZE = 36
SUPPORTED_IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"}

# =========================
# רצף אותיות עבריות אינסופי (א..ת ואז אא, אב...)
# =========================
HEBREW_LETTERS = [
    "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י",
    "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת"
]
BASE = len(HEBREW_LETTERS)

def index_to_hebrew(i: int) -> str:
    if i <= 0:
        return ""
    s = ""
    n = i
    while n > 0:
        n -= 1
        s = HEBREW_LETTERS[n % BASE] + s
        n //= BASE
    return s

# =========================
# גופנים – מציאה/טעינה
# =========================
@dataclass
class FontChoice:
    name: str
    path: Optional[str]

def list_system_fonts() -> List[FontChoice]:
    fonts = []
    for f in font_manager.fontManager.ttflist:
        try:
            fonts.append(FontChoice(name=f.name, path=f.fname))
        except Exception:
            pass
    # ייחוד לפי שם
    seen = set()
    unique = []
    for fc in fonts:
        if fc.name not in seen:
            seen.add(fc.name)
            unique.append(fc)
    unique.sort(key=lambda x: x.name.lower())
    return unique

@st.cache_data(show_spinner=False)
def fetch_david_libre() -> Optional[bytes]:
    """מנסה להוריד David Libre ברישיון OFL מגיטהאב (Google Fonts)."""
    urls = [
        "https://github.com/google/fonts/raw/main/ofl/davidlibre/DavidLibre-Regular.ttf",
    ]
    for url in urls:
        try:
            r = requests.get(url, timeout=15)
            if r.status_code == 200 and r.content:
                return r.content
        except Exception:
            continue
    # נסה טעינה מקומית אם יש
    local_path = os.path.join("assets", "DavidLibre-Regular.ttf")
    if os.path.isfile(local_path):
        with open(local_path, "rb") as f:
            return f.read()
    return None

def load_truetype_font(font_bytes: bytes, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(io.BytesIO(font_bytes), size=size)

# =========================
# PDF -> תמונות
# =========================
def pdf_to_images(file_bytes: bytes, all_pages: bool) -> List[Image.Image]:
    images = []
    with fitz.open(stream=file_bytes, filetype='pdf') as doc:
        pages = range(doc.page_count) if all_pages else [0]
        zoom = DPI / 72.0
        mat = fitz.Matrix(zoom, zoom)
        for pno in pages:
            page = doc.load_page(pno)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            img = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
            images.append(img)
    return images

def open_uploaded_to_images(uploaded_file, all_pages: bool) -> List[Image.Image]:
    filename = uploaded_file.name
    _, ext = os.path.splitext(filename.lower())
    data = uploaded_file.read()

    if ext == ".pdf" or uploaded_file.type == "application/pdf":
        return pdf_to_images(data, all_pages=all_pages)

    try:
        img = Image.open(io.BytesIO(data))
        img = ImageOps.exif_transpose(img).convert("RGB")
        return [img]
    except UnidentifiedImageError:
        st.error(f"קובץ {uploaded_file.name} אינו תמונה נתמכת")
        return []

# =========================
# קומפוזיציית עמוד A4
# =========================
def compose_a4_page(content_img: Image.Image, title: str, font_bytes: bytes, font_size_pt: int,
                    margin_top_px: int, side_margin_px: int, spacing_px: int) -> Image.Image:
    page = Image.new('RGB', (A4_W, A4_H), color=(255, 255, 255))
    draw = ImageDraw.Draw(page)

    # RTL וויזואליזציה
    title_vis = get_display(title)

    font = load_truetype_font(font_bytes, size=font_size_pt)

    tb = draw.textbbox((0, 0), title_vis, font=font)
    text_w = tb[2] - tb[0]
    text_h = tb[3] - tb[1]

    text_x = (A4_W - text_w) // 2
    text_y = margin_top_px

    draw.text((text_x, text_y), title_vis, fill=(0, 0, 0), font=font)

    available_top = text_y + text_h + spacing_px
    available_height = max(1, A4_H - available_top - margin_top_px)
    available_width = max(1, A4_W - 2 * side_margin_px)

    img_w, img_h = content_img.size
    scale = min(available_width / img_w, available_height / img_h)
    new_w = max(1, int(img_w * scale))
    new_h = max(1, int(img_h * scale))

    resized = content_img.resize((new_w, new_h), Image.LANCZOS)

    img_x = (A4_W - new_w) // 2
    img_y = available_top + (available_height - new_h) // 2

    page.paste(resized, (img_x, img_y))
    return page

# =========================
# DOCX (Word)
# =========================
def add_bidi(paragraph):
    p = paragraph._element
    pPr = p.get_or_add_pPr()
    bidi = OxmlElement('w:bidi')
    pPr.append(bidi)

def create_docx(pages_info: List[Tuple[Image.Image, str]], font_name: str, font_size_pt: int,
                margins_mm: Tuple[float, float, float, float]) -> bytes:
    doc = Document()
    section = doc.sections[0]
    section.page_width = Mm(210)
    section.page_height = Mm(297)
    top_mm, right_mm, bottom_mm, left_mm = margins_mm
    section.top_margin = Mm(top_mm)
    section.right_margin = Mm(right_mm)
    section.bottom_margin = Mm(bottom_mm)
    section.left_margin = Mm(left_mm)

    for pil_img, title in pages_info:
        p = doc.add_paragraph()
        add_bidi(p)
        run = p.add_run(get_display(title))
        run.font.name = font_name
        rFonts = OxmlElement('w:rFonts')
        rFonts.set(qn('w:ascii'), font_name)
        rFonts.set(qn('w:hAnsi'), font_name)
        rFonts.set(qn('w:cs'), font_name)
        run._element.rPr.append(rFonts)
        run.font.size = Pt(font_size_pt)

        bio = io.BytesIO()
        pil_img.save(bio, format='PNG')
        bio.seek(0)
        page_w_mm = 210 - left_mm - right_mm
        doc.add_picture(bio, width=Mm(page_w_mm))
        doc.add_page_break()

    out = io.BytesIO()
    doc.save(out)
    return out.getvalue()

# =========================
# Streamlit UI
# =========================
st.set_page_config(page_title="יוצר נספחים A4 בעברית", layout="wide", page_icon="📄")

st.title("📄 יוצר נספחים A4 בעברית – PDF/Word")
st.caption("העלה תמונות/‏PDF, בחר גופן וגודל, וקבל חוברת נספחים עם כותרות כמו ‘נספח א׳’ מעל כל עמוד.")

with st.sidebar:
    st.header("⚙️ הגדרות")
    sys_fonts = list_system_fonts()

    q = st.text_input("חפש גופן", value="David")
    filtered = [f for f in sys_fonts if q.lower() in f.name.lower()] if q else sys_fonts
    if not filtered:
        st.info("לא נמצא גופן תואם בחיפוש. אפשר להעלות קובץ TTF או להשתמש ב-David Libre האוטומטי.")
        filtered = sys_fonts

    selected_font_name = st.selectbox("בחר גופן מותקן", options=[f.name for f in filtered] or ["(אין)"])
    selected_font_path = next((f.path for f in sys_fonts if f.name == selected_font_name), None)

    uploaded_ttf = st.file_uploader("או העלה קובץ גופן (TTF/OTF)", type=["ttf", "otf"])

    font_size = st.slider("גודל כותרת (pt)", min_value=4, max_value=168, value=DEFAULT_FONT_SIZE)
    margin_top = st.slider("שול עליון (px)", min_value=0, max_value=400, value=80)
    side_margin = st.slider("שולי צד (px)", min_value=0, max_value=400, value=80)
    spacing = st.slider("מרווח כותרת-תוכן (px)", min_value=0, max_value=300, value=40)

    st.subheader("מקור ה-PDF")
    pdf_mode = st.radio("עיבוד PDF", options=["עמוד ראשון בלבד", "כל העמודים (נספחים נפרדים)"], index=0)
    all_pages = (pdf_mode == "כל העמודים (נספחים נפרדים)")

    st.subheader("יצוא")
    export_choices = st.multiselect(
        "בחר פורמטי יצוא",
        ["PDF מאוחד", "DOCX (Word)", "ZIP (נספחים בודדים)"],
        default=["PDF מאוחד"]
    )

st.markdown("---")

uploads = st.file_uploader(
    "העלה קבצים (תמונות/‏PDF)", accept_multiple_files=True,
    type=["pdf", "png", "jpg", "jpeg", "webp", "tif", "tiff"]
)

# פונקציית בחירת גופן בשימוש בפועל
def resolve_font_bytes() -> Tuple[bytes, str]:
    # עדיפות: העלאה ידנית -> גופן מערכת -> David Libre אוטומטי/מקומי
    if uploaded_ttf is not None:
        return uploaded_ttf.read(), uploaded_ttf.name
    if selected_font_path and os.path.isfile(selected_font_path):
        with open(selected_font_path, 'rb') as f:
            return f.read(), selected_font_name
    dl = fetch_david_libre()
    if dl:
        return dl, "David Libre"
    st.error("לא ניתן היה לטעון גופן. נסה להעלות TTF או לבחור גופן מערכת.")
    st.stop()

if uploads:
    st.subheader("כותרות נספח")
    st.caption("ניתן לערוך ידנית כל כותרת. ברירת מחדל: ‘נספח א׳’, ‘נספח ב׳’ וכו׳.")

    st.markdown("#### סדר העיבוד")
    st.caption("ניתן לקבוע סדר באמצעות מספר. קטנים באים קודם.")

    title_rows = []
    for idx, uf in enumerate(uploads, start=1):
        default_label = f"נספח {index_to_hebrew(idx)}׳"
        col1, col2, col3 = st.columns([0.35, 0.45, 0.2])
        with col1:
            st.write(f"**{uf.name}**")
        with col2:
            title_val = st.text_input("כותרת:", value=default_label, key=f"title_{idx}")
        with col3:
            order_val = st.number_input("#", min_value=1, max_value=10000, value=idx, step=1, key=f"order_{idx}")
        title_rows.append((order_val, uf, title_val))

    title_rows.sort(key=lambda t: t[0])

    st.markdown("---")

    if st.button("🔧 עבד וייצא", type="primary"):
        font_bytes, chosen_font_name = resolve_font_bytes()

        pages: List[Image.Image] = []
        pages_named: List[Tuple[Image.Image, str]] = []
        indiv_pdf_buffers: List[Tuple[str, bytes]] = []

        preview_cols = st.columns(3)
        preview_slot = 0

        for order_val, uf, title in title_rows:
            uf.seek(0)
            images = open_uploaded_to_images(uf, all_pages=all_pages)
            if not images:
                continue
            for page_idx, img in enumerate(images, start=1):
                title_eff = title if len(images) == 1 else f"{title} – עמוד {page_idx}"
                a4_page = compose_a4_page(
                    content_img=img,
                    title=title_eff,
                    font_bytes=font_bytes,
                    font_size_pt=font_size,
                    margin_top_px=margin_top,
                    side_margin_px=side_margin,
                    spacing_px=spacing,
                )
                pages.append(a4_page)
                pages_named.append((a4_page, title_eff))

                indiv_buf = io.BytesIO()
                a4_page.save(indiv_buf, format='PDF', resolution=DPI)
                indiv_pdf_buffers.append((title_eff, indiv_buf.getvalue()))

                with preview_cols[preview_slot % 3]:
                    st.image(a4_page.resize((min(500, A4_W//3), min(700, A4_H//3))), caption=title_eff)
                preview_slot += 1

        st.success(f"נוצרו {len(pages)} עמודים מעוצבים.")
        colA, colB, colC = st.columns(3)

        if "PDF מאוחד" in export_choices and pages:
            all_pdf = io.BytesIO()
            pages[0].save(all_pdf, format='PDF', save_all=True, append_images=pages[1:], resolution=DPI)
            all_pdf_bytes = all_pdf.getvalue()
            with colA:
                st.download_button(
                    label="⬇️ הורד PDF מאוחד",
                    data=all_pdf_bytes,
                    file_name="נספחים_מאוחד.pdf",
                    mime="application/pdf"
                )

        if "ZIP (נספחים בודדים)" in export_choices and indiv_pdf_buffers:
            zip_buf = io.BytesIO()
            with zipfile.ZipFile(zip_buf, 'w', compression=zipfile.ZIP_DEFLATED) as z:
                for title_eff, pdf_bytes in indiv_pdf_buffers:
                    safe_name = title_eff.replace('/', '_').replace('\\\\', '_')
                    z.writestr(f"{safe_name}.pdf", pdf_bytes)
            with colB:
                st.download_button(
                    label="⬇️ הורד ZIP של נספחים בודדים",
                    data=zip_buf.getvalue(),
                    file_name="נספחים_בודדים.zip",
                    mime="application/zip"
                )

        if "DOCX (Word)" in export_choices and pages_named:
            docx_bytes = create_docx(pages_named, font_name=chosen_font_name, font_size_pt=font_size,
                                     margins_mm=(15, 15, 15, 15))
            with colC:
                st.download_button(
                    label="⬇️ הורד DOCX",
                    data=docx_bytes,
                    file_name="נספחים.docx",
                    mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                )

        st.markdown("### הורדת נספחים בודדים")
        for title_eff, pdf_bytes in indiv_pdf_buffers:
            st.download_button(
                label=f"⬇️ הורד \"{title_eff}\" כ-PDF",
                data=pdf_bytes,
                file_name=f"{title_eff.replace('/', '_').replace('\\\\', '_')}.pdf",
                mime="application/pdf",
                key=f"dl_{title_eff}"
            )
else:
    st.info("העלה קבצי PDF/תמונות כדי להתחיל.")
