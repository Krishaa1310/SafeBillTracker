import fitz

def check_coords():
    input_path = r"c:\Users\krish\OneDrive\Desktop\CC Lab manual .pdf.pdf"
    doc = fitz.open(input_path)
    
    for page_num in [3, 11]:  # page 4 and page 12
        page = doc[page_num]
        print(f"--- Page {page_num + 1} ---")
        print(f"Page Rect: {page.rect}")
        
        texts_to_find = [
            "Faculty of Engineering & Technology",
            "Name: Krisha Patel",
            "Enrollment No.: 2403031250020",
            "Division: 4CSE4 (BDA)"
        ]
        
        for text in texts_to_find:
            rects = page.search_for(text)
            for r in rects:
                print(f"'{text}' found at: {r}")

        # Also let's check drawing paths to find the border rectangle
        paths = page.get_drawings()
        border_rects = []
        for p in paths:
            # We look for large rectangles that could be borders
            r = p["rect"]
            if r.width > 400 and r.height > 600:
                border_rects.append(r)
        
        print(f"Potential borders: {border_rects}")

if __name__ == "__main__":
    check_coords()
