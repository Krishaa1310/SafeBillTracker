import fitz

def edit_pdf_preserve_borders():
    # Start fresh from the original edited pdf
    input_path = r"c:\Users\krish\OneDrive\Desktop\CC Lab manual edited.pdf"
    output_path = r"c:\Users\krish\OneDrive\Desktop\CC Lab manual final.pdf"
    
    doc = fitz.open(input_path)

    header_lines = [
        "Faculty of Engineering & Technology",
        "Subject Name: Competitive Coding",
        "(303105259)",
        "B.Tech. CSE Year 2 Semester 4"
    ]
    
    font_name = "times-bold"
    font_size = 11

    x_margin_right = 36 
    y_margin_top = 36 
    y_margin_bottom = 780 
    x_margin_left = 36
    
    w_max_head = 0
    font = fitz.Font(font_name)
    for line in header_lines:
        w = font.text_length(line, fontsize=font_size)
        if w > w_max_head:
            w_max_head = w

    for i, page in enumerate(doc):
        page_rect = page.rect
        redacted_something = False
        
        # 1. Redact Headers safely
        top_rect = fitz.Rect(0, 0, page_rect.width, 150)
        for text in header_lines + ["Subject Code: 303105259", "Subject Code:  303105259"]:
            rects = page.search_for(text, clip=top_rect)
            for r in rects:
                # Add a redaction, without fill
                page.add_redact_annot(r)
                redacted_something = True
                
        # 2. Redact Footers safely
        bottom_rect = fitz.Rect(0, 720, page_rect.width, page_rect.height)
        blocks = page.get_text("blocks", clip=bottom_rect)
        for b in blocks:
            x0, y0, x1, y1, t, block_no, block_type = b
            t_str = t.strip()
            if not t_str.isdigit() and y0 > 720:
                for line in t_str.split("\n"):
                    line = line.strip()
                    if len(line) > 1:
                        rects = page.search_for(line, clip=bottom_rect)
                        for r in rects:
                            page.add_redact_annot(r)
                            redacted_something = True
                            
        # 3. Handle Index Page (Page 4) uneven numbers safely
        shifted_nums = []
        if i == 3: # Page 4
            num_blocks = page.get_text("blocks")
            for b in num_blocks:
                x0, y0, x1, y1, t, block_no, block_type = b
                t_str = t.strip()
                if t_str.isdigit() and 240 < x0 < 320 and y0 > 100:
                    r = fitz.Rect(x0, y0, x1, y1)
                    page.add_redact_annot(r)
                    redacted_something = True
                    dy = -14 if y0 >= 210 else -1
                    shifted_nums.append((x0, y0 + dy, t_str))

        if redacted_something:
            # Pass images=0 and graphics=0 to preserve drawings (like the borders!)
            page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=0)

        # Insert Standard Header
        block_x = page_rect.width - w_max_head - x_margin_right
        y = y_margin_top + font_size
        for line in header_lines:
            page.insert_text(fitz.Point(block_x, y), line, fontname=font_name, fontsize=font_size, color=(0,0,0))
            y += font_size * 1.5

        # Insert Standard Footer
        page.insert_text(fitz.Point(x_margin_left, y_margin_bottom), "Name:       Krisha Patel", fontname="times-roman", fontsize=10, color=(0,0,0))
        page.insert_text(fitz.Point(x_margin_left, y_margin_bottom + 15), "Enrollment No.: 2403031250020", fontname="times-roman", fontsize=10, color=(0,0,0))
        
        div_text = "Division: 4CSE4 (BDA)"
        w_div = font.text_length(div_text, fontsize=10)
        div_x = page_rect.width - w_div - x_margin_right
        page.insert_text(fitz.Point(div_x, y_margin_bottom + 15), div_text, fontname="times-roman", fontsize=10, color=(0,0,0))

        if i == 3:
            for sx, sy, snum in shifted_nums:
                page.insert_text(fitz.Point(sx, sy + 10), snum, fontname="times-roman", fontsize=11, color=(0,0,0)) 

    doc.save(output_path)
    print(f"Saved final edited manual to {output_path}")
    doc.close()

if __name__ == "__main__":
    edit_pdf_preserve_borders()
