import sys
import re

def update_expo_credentials(file_path, username, password):
    try:
        with open(file_path, 'r') as file:
            content = file.read()
    except FileNotFoundError:
        content = ""

    # Update or add EXPO_USERNAME
    content = re.sub(r'^EXPO_USERNAME=.*$', f'EXPO_USERNAME={username}', content, flags=re.MULTILINE)
    if 'EXPO_USERNAME' not in content:
        content += f'\nEXPO_USERNAME={username}'

    # Update or add EXPO_PASSWORD
    content = re.sub(r'^EXPO_PASSWORD=.*$', f'EXPO_PASSWORD={password}', content, flags=re.MULTILINE)
    if 'EXPO_PASSWORD' not in content:
        content += f'\nEXPO_PASSWORD={password}'

    with open(file_path, 'w') as file:
        file.write(content)

    print("Expo credentials updated successfully in .env file.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python update_expo_credentials.py <username> <password>")
        sys.exit(1)

    username = sys.argv[1]
    password = sys.argv[2]
    env_file_path = '.env'
    update_expo_credentials(env_file_path, username, password)