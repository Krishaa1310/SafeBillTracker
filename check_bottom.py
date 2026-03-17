import fitz

def check_bottom_text():
    input_path = r"c:\Users\krish\OneDrive\Desktop\CC Lab manual edited.pdf"
    doc = fitz.open(input_path)
    
    for page_num in [3, 11]:  # page 4 and page 12
        page = doc[page_num]
        print(f"--- Page {page_num + 1} ---")
        
        blocks = page.get_text("blocks")
        for b in blocks:
            x0, y0, x1, y1, text, block_no, block_type = b
            if y0 > 720:
                print(f"Bottom Text: {text.strip()!r} at y0={y0:.1f}, x0={x0:.1f}")

if __name__ == "__main__":
    check_bottom_text()
