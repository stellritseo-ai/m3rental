import os
import re
import json
import openpyxl

# 2. Category mapping helper
def map_category(cat_raw, name_raw, type_raw):
    cat = (cat_raw or "").strip().lower()
    name = (name_raw or "").strip().lower()
    vtype = (type_raw or "").strip().lower()
    combined = f"{cat} {name} {vtype}"

    if "pickup" in combined or "ridgeline" in combined or "tundra" in combined or "f-150" in combined or "silverado" in combined:
        return "pickup-trucks"
    if "bucket truck" in combined or "dump truck" in combined or "flatbed" in combined or "freightliner" in combined or "f-450" in combined or "f-550" in combined or "dually" in combined:
        return "trucks"
    if "trailer" in combined or "gooseneck" in combined or "hauler" in combined:
        return "trailers"
    if "boom lift" in combined or "backhoe" in combined or "tractor" in combined or "excavator" in combined or "crane" in combined:
        return "construction-equipment"
    if "welder" in combined or "welding" in combined or "cylinder" in combined:
        return "welding-equipment"
    if "safety" in combined or "harness" in combined or "ppe" in combined:
        return "safety-equipment"
    if "generator" in combined or "compressor" in combined:
        return "generators"
    if "video wall" in combined or "led" in combined or "display" in combined:
        return "digital-equipment"
    if "tortilla" in combined or "machine" in combined:
        return "machines"
    if "sedan" in combined or "fusion" in combined or "mercedes" in combined or "car" in combined:
        return "cars"
    if "suv" in combined or "crossover" in combined:
        return "suvs"
    if "bus" in combined or "shuttle" in combined or "motorhome" in combined:
        return "buses"
    if "tool" in combined or "saw" in combined or "drill" in combined or "hammer" in combined or "trowel" in combined:
        return "tools"
    return "tools" if "tool" in cat else "utility-equipment"

# 3. Read image mapping from existing equipment.ts
img_mapping = {}
eq_ts_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "equipment.ts")
if os.path.exists(eq_ts_path):
    with open(eq_ts_path) as f:
        eq_content = f.read()
    blocks = re.split(r'\{\s*id:\s*"', eq_content)[1:]
    for b in blocks:
        id_match = re.match(r'(M3-\d+)"', b)
        img_match = re.search(r'image:\s*"([^"]+)"', b)
        if id_match and img_match:
            img_mapping[id_match.group(1)] = img_match.group(1)

DEFAULT_CLOUDINARY_IMG = "https://res.cloudinary.com/j44njcfx/image/upload/v1792079373/m3-rental-fleet/eq-midsize-pickup.jpg"

# 4. Parse Excel
excel_path = os.path.join(os.path.dirname(__file__), "..", "M3_Rental.xlsx")
wb = openpyxl.load_workbook(excel_path)
sheet = wb["Products"]
rows = list(sheet.iter_rows(values_only=True))
headers = [str(h).strip() if h else f"col_{i}" for i, h in enumerate(rows[0])]

products = []
for i, r in enumerate(rows[1:], start=1):
    if not r or not r[0]:
        continue
    row = dict(zip(headers, r))
    pid = str(row.get("Product ID") or f"M3-{str(i).zfill(3)}").strip()
    name = str(row.get("Product Name") or "").strip()
    vtype = str(row.get("Vehicle / Equipment Type") or name).strip()
    cat_raw = str(row.get("Category") or "").strip()
    color = str(row.get("Color") or "").strip() if row.get("Color") else None
    ext_desc = str(row.get("Exterior Features / Description") or "").strip() if row.get("Exterior Features / Description") else None
    specs = str(row.get("Key Specifications / Capabilities") or "").strip() if row.get("Key Specifications / Capabilities") else None
    op_serv = str(row.get("Operator / Service") or "").strip() if row.get("Operator / Service") else None
    price_val = row.get("Price")
    unit_val = str(row.get("Pricing Unit") or "Per day").strip()
    op_inc = str(row.get("Operator Included") or "No").strip().lower()

    if isinstance(price_val, (int, float)):
        day_rate = int(price_val)
    elif isinstance(price_val, str):
        nums = re.findall(r"\d+", price_val)
        day_rate = int(nums[0]) if nums else 50
    else:
        day_rate = 50

    operator = "operator" if op_inc in ["yes", "true", "included"] else "self"
    operator_included = (operator == "operator")

    category = map_category(cat_raw, name, vtype)
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

    features = []
    if ext_desc:
        for f in ext_desc.split(";"):
            f_clean = f.strip()
            if f_clean and f_clean not in features:
                features.append(f_clean)
    if specs and len(features) < 4:
        for f in specs.split(";"):
            f_clean = f.strip()
            if f_clean and f_clean not in features:
                features.append(f_clean)
    if not features:
        features = [name]
        if color:
            features.append(color)

    image = img_mapping.get(pid, DEFAULT_CLOUDINARY_IMG)
    year_match = re.search(r"\b(20\d\d|19\d\d)\b", name)
    year = year_match.group(1) if year_match else None
    summary = ext_desc or specs or f"{name} available for commercial and utility rental in Houston, TX."

    prod = {
        "id": pid,
        "slug": slug,
        "name": name,
        "category": category,
        "type": vtype,
        "color": color,
        "year": year,
        "summary": summary[:250],
        "features": features[:8],
        "dayRate": day_rate,
        "pricingUnit": unit_val,
        "operator": operator,
        "operatorIncluded": operator_included,
        "operatorService": op_serv,
        "specs": specs,
        "featured": i in [1, 2, 4, 10, 15, 23, 29, 36],
        "image": image,
        "status": "available",
        "vin": f"1HGCR{1000 + i}8A00{200 + i}",
        "updatedAt": "2026-10-16T10:00:00.000Z",
    }
    products.append(prod)

out_file = os.path.join(os.path.dirname(__file__), "parsed_equipment.json")
with open(out_file, "w") as f:
    json.dump(products, f, indent=2)

print(f"Exported {len(products)} products to {out_file}")
