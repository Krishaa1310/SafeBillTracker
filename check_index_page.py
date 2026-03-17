import fitz

def check_index_x():
    input_path = r"c:\Users\krish\OneDrive\Desktop\CC Lab manual edited.pdf"
    doc = fitz.open(input_path)
    page = doc[3]  # Page 4
    blocks = page.get_text("blocks")
    for b in blocks:
        x0, y0, x1, y1, t, block_no, block_type = b
        t_str = t.strip()
        if t_str.isdigit() and 30 <= int(t_str) <= 90:
            print(f"Num {t_str!r}: x0={x0:.1f}, y0={y0:.1f}")

if __name__ == "__main__":
    check_index_x()
