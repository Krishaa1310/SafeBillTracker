import fitz

def generate_previews():
    input_path = r"c:\Users\krish\OneDrive\Desktop\CC Lab manual final.pdf"
    doc = fitz.open(input_path)
    
    for p in [3, 11]:
        page = doc[p]
        pix = page.get_pixmap(dpi=150)
        pix.save(rf"c:\Users\krish\OneDrive\Desktop\SafeBillTracker\final_p{p+1}.png")

if __name__ == "__main__":
    generate_previews()
