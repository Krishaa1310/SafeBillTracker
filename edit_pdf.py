import fitz

def edit_pdf():
    input_path = r"c:\Users\krish\OneDrive\Desktop\CC Lab manual .pdf.pdf"
    output_path = r"c:\Users\krish\OneDrive\Desktop\CC Lab manual edited.pdf"
    
    try:
        doc = fitz.open(input_path)
    except Exception as e:
        print(f"Failed to open PDF: {e}")
        return

    texts_to_remove = [
        "Faculty of Engineering & Technology",
        "Subject Name: Competitive Coding",
        "Subject Code: 303105259",
        "B.Tech. CSE Year 2 Semester 4",
        "Subject Code:  303105259",
        "(303105259)"
    ]
    
    new_lines = [
        "Faculty of Engineering & Technology",
        "Subject Name: Competitive Coding",
        "(303105259)",
        "B.Tech. CSE Year 2 Semester 4"
    ]
    
    font_size = 11
    font_name = "times-bold"
    x_margin = 36 # half inch
    y_margin = 36 # half inch
    
    # Calculate block width
    w_max = 0
    font = fitz.Font(font_name)
    for line in new_lines:
        w = font.text_length(line, fontsize=font_size)
        if w > w_max:
            w_max = w

    for i, page in enumerate(doc):
        # search for exact text or similar within top 200 points
        page_rect = page.rect
        search_rect = fitz.Rect(0, 0, page_rect.width, 200)
        
        redacted_something = False
        
        for text in texts_to_remove:
            rects = page.search_for(text, clip=search_rect)
            for rect in rects:
                # Do not expand the rect to avoid overlapping with page borders
                page.add_redact_annot(rect, fill=(1, 1, 1))
                redacted_something = True
                
        # Apply redactions
        if redacted_something:
            page.apply_redactions()
            
            # Insert new text block at top-right
            block_x = page_rect.width - w_max - x_margin
            y = y_margin + font_size # y is the baseline for text insertion
            
            for line in new_lines:
                page.insert_text(fitz.Point(block_x, y), line, fontname=font_name, fontsize=font_size, color=(0,0,0))
                y += font_size * 1.5
                
    doc.save(output_path)
    print(f"Processed all {len(doc)} pages and saved to {output_path}")

    # Render preview of page 2
    image_preview_path = r"c:\Users\krish\OneDrive\Desktop\SafeBillTracker\edited_preview_p2.png"
    page2 = doc[1]
    pix = page2.get_pixmap(dpi=150)
    pix.save(image_preview_path)

if __name__ == "__main__":
    edit_pdf()
