import glob
import tqdm
import json
import pandas as pd

DATA_PATH = "../../MultiModalDataset"

positive_users = sorted(glob.glob(f"{DATA_PATH}/positive/*"))
negative_users = sorted(glob.glob(f"{DATA_PATH}/negative/*"))

user_dates = {}

for user_path in tqdm.tqdm(positive_users + negative_users):
    try:
        with open(f"{user_path}/timeline.txt", 'r') as file:
            df = pd.read_json(f"{user_path}/timeline.txt", lines=True)
            user_dates[user_path.split("/")[-1]] = [
                int(round(date.timestamp())) for date in df["created_at"].tolist()
            ]
    except FileNotFoundError:
        print(f"File not found: {user_path}/timeline.txt")
        continue
with open("../datasets2/twitter-dates.json", "wt") as f:
    json.dump(user_dates, f)
