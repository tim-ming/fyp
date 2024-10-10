import yaml
from datasets2 import *
from models import *
from evaluators import MultimodalEvaluator

import torch

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

DATASETS = {
    "reddit": RedditDataset,
    "twitter": TwitterDataset,
}

EVALUATORS = {
    "multimodal-evaluator": MultimodalEvaluator,
}

MODELS = {
    "multimodal-transformer": MultiModalTransformer,
    "singlemodal-transformer": SingleModalTransformer,
    "tlstm": TimeLSTM,
}
