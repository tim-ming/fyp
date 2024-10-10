#!/bin/bash
set -e
python extract_twitter_embeddings.py --modality text --embs emoberta
python extract_twitter_embeddings.py --modality image --embs clip
