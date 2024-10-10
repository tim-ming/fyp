import sys
import re

def update_backend_url(file_path, new_ip):
    with open(file_path, 'r') as file:
        content = file.read()

    # Use regex to find and replace the BACKEND_URL line
    updated_content = re.sub(
        r'export const BACKEND_URL = .*?;',
        f'export const BACKEND_URL = "http://{new_ip}:8000";',
        content
    )

    with open(file_path, 'w') as file:
        file.write(updated_content)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python update_backend_url.py <private_ip_address>")
        sys.exit(1)

    new_ip = sys.argv[1]
    file_path = 'frontend/constants/globals.ts'
    update_backend_url(file_path, new_ip)
    print(f"Backend URL updated to http://{new_ip}:8000")