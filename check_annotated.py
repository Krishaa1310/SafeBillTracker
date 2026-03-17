import fitz

def create_annotated_preview():
    input_path = r"c:\Users\krish\OneDrive\Desktop\CC Lab manual .pdf.pdf"
    doc = fitz.open(input_path)
    
    for page_num in [3, 11]:  # page 4 and page 12
        page = doc[page_num]
        
        texts_to_find = [
            "Faculty of Engineering & Technology",
            "Name: Krisha Patel",
            "Enrollment No.: 2403031250020",
            "Division: 4CSE4 (BDA)"
        ]
        
        for text in texts_to_find:
            rects = page.search_for(text)
            for r in rects:
                page.draw_rect(r, color=(1, 0, 0), width=1.5)

        paths = page.get_drawings()
        for p in paths:
            r = p["rect"]
            if r.width > 400 or r.height > 600:
                page.draw_rect(r, color=(0, 0, 1), width=1.5)
                
        preview_path = rf"c:\Users\krish\OneDrive\Desktop\SafeBillTracker\annotated_p{page_num+1}.png"
        pix = page.get_pixmap(dpi=150)
        pix.save(preview_path)

if __name__ == "__main__":
    create_annotated_preview()
