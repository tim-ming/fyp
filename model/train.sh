#!/bin/bash
set -e
GROUP=experiments

#########################################
############# TWITTER MULTIMODAL ########
#########################################

python main.py  --config_file configs/combos/clip_emoberta.yaml --name fold-0-twitter-ws-32-clip-emoberta-time2vec --group $GROUP --dataset twitter --fold 0 --window_size 32  --position_embeddings time2vec --mode run --epochs 200 --batch_size 256
python main.py  --config_file configs/combos/clip_emoberta.yaml --name fold-0-twitter-ws-64-clip-emoberta-time2vec   --group $GROUP --dataset twitter --fold 0 --window_size 64  --position_embeddings time2vec --mode run --epochs 200 --batch_size 256
python main.py  --config_file configs/combos/clip_emoberta.yaml --name fold-0-twitter-ws-128-clip-emoberta-time2vec  --group $GROUP --dataset twitter --fold 0 --window_size 128 --position_embeddings time2vec --mode run --epochs 200 --batch_size 256
python main.py  --config_file configs/combos/clip_emoberta.yaml --name fold-0-twitter-ws-256-clip-emoberta-time2vec  --group $GROUP --dataset twitter --fold 0 --window_size 256 --position_embeddings time2vec --mode run --epochs 200 --batch_size 64 --accumulation_steps 4
python main.py  --config_file configs/combos/clip_emoberta.yaml --name fold-0-twitter-ws-512-clip-emoberta-time2vec  --group $GROUP --dataset twitter --fold 0 --window_size 512 --position_embeddings time2vec --mode run --epochs 200 --batch_size 32 --accumulation_steps 8

# Repeat for folds 1-4
for fold in {1..2}
do
    for window_size in 64 128 256
    do
        batch_size=256
        accumulation_steps=1
        if [ $window_size -eq 256 ]; then
            batch_size=64
            accumulation_steps=4
        elif [ $window_size -eq 512 ]; then
            batch_size=32
            accumulation_steps=8
        fi
        
        python main.py  --config_file configs/combos/clip_emoberta.yaml --name fold-${fold}-twitter-ws-${window_size}-clip-emoberta-time2vec --group $GROUP --dataset twitter --fold $fold --window_size $window_size --position_embeddings time2vec --mode run --epochs 200 --batch_size $batch_size --accumulation_steps $accumulation_steps
    done
done