import sys
from PIL import Image

def remove_background(input_path, output_path, fuzz=30):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        # Removing white/near white pixels
        for item in datas:
            # item is (R, G, B, A)
            if item[0] > 255 - fuzz and item[1] > 255 - fuzz and item[2] > 255 - fuzz:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input> <output>")
        sys.exit(1)
        
    remove_background(sys.argv[1], sys.argv[2])
