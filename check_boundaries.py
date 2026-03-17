import fitz

def check_borders():
    input_path = r"c:\Users\krish\OneDrive\Desktop\CC Lab manual .pdf.pdf"
    doc = fitz.open(input_path)
    
    for page_num in [3, 11]:  # page 4 and page 12
        page = doc[page_num]
        print(f"--- Page {page_num + 1} ---")
        
        paths = page.get_drawings()
        for p in paths:
            # check bounding box of the drawing
            r = p["rect"]
            # A border line will be either very wide (horizontal) or very tall (vertical)
            if r.width > 400 or r.height > 600:
                print(f"Large drawing rect: {r}")

if __name__ == "__main__":
    check_borders()
