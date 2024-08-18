import os
import sys
import xml.etree.ElementTree as ET

ET.register_namespace("", "http://www.w3.org/2000/svg")


def move_svg_styles(svg_str):
    # Parse the SVG XML string
    root = ET.fromstring(svg_str)

    # Initialize properties to move to the svg tag
    common_properties = {"stroke": None, "stroke-width": None, "fill": None}

    # Loop through all children of the SVG root
    for elem in root.findall(".//*"):
        # Check for stroke, stroke-width, and fill attributes in nested elements
        for prop in common_properties:
            if prop in elem.attrib:
                # Set the property in the svg tag if it doesn't exist or is different
                if common_properties[prop] is None:
                    common_properties[prop] = elem.attrib[prop]
                elif common_properties[prop] != elem.attrib[prop]:
                    common_properties[prop] = elem.attrib[prop]

                # Remove the property from the nested element
                del elem.attrib[prop]

    # Apply the collected properties to the svg tag
    for prop, value in common_properties.items():
        if value:
            root.attrib[prop] = value

    # Convert the modified XML tree back into a string
    return ET.tostring(root, encoding="unicode")


def process_svg_files(input_files, output_dir):
    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    for input_file in input_files:
        # Read the SVG content from the input file
        with open(input_file, "r", encoding="utf-8") as file:
            svg_str = file.read()

        # Process the SVG content
        new_svg_str = move_svg_styles(svg_str)

        # Write the modified SVG content to the output file
        output_file = os.path.join(output_dir, os.path.basename(input_file))
        with open(output_file, "w", encoding="utf-8") as file:
            file.write(new_svg_str)


# if __name__ == "__main__":
#     INPUT_DIR = "../assets/icons/"
#     if len(sys.argv) < 3:
#         print(
#             "Usage: python svgparser.py <output_directory> <input_file1> <input_file2> ..."
#         )
#         sys.exit(1)

#     output_directory = sys.argv[1]
#     input_files = map(lambda x: INPUT_DIR + x, sys.argv[2:])

#     process_svg_files(input_files, output_directory)
#     print(f"Processed SVG files saved to {output_directory}")


if __name__ == "__main__":
    INPUT_DIR = "../assets/icons/"
    OUTPUT_DIR = "./svgparser_output"
    if len(sys.argv) < 3:
        print("Usage: python svgparser.py <input_file1> <input_file2> ...")
        sys.exit(1)

    input_files = map(lambda x: INPUT_DIR + x, sys.argv[1:])

    process_svg_files(input_files, OUTPUT_DIR)
    print(f"Processed SVG files saved to {OUTPUT_DIR}")
