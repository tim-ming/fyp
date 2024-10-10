import datetime
from io import BytesIO
import os
import traceback
from types import SimpleNamespace
from typing import List, Optional
import aiohttp
from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import time
from sentence_transformers import SentenceTransformer
from transformers import (
    CLIPProcessor, CLIPVisionModel,
    RobertaModel, RobertaTokenizer,
    AutoModel, AutoTokenizer
)

import nomenclature
from utils import extend_config, load_model
from PIL import Image, UnidentifiedImageError

# Define the embs_type dictionary
embs_type = {
    "image": {
        "clip": {
            "model_name": "openai/clip-vit-base-patch32",
            "model_class": CLIPVisionModel,
            "input_representation": CLIPProcessor,
        },
    },
    "text": {
        "roberta": {
            "model_name": "sentence-transformers/stsb-roberta-base",
            "model_class": RobertaModel,
            "input_representation": RobertaTokenizer,
        },
        "emoberta": {
            "model_name": "tae898/emoberta-base",
            "model_class": AutoModel,
            "input_representation": AutoTokenizer,
        },
    },
}

def create_args_manually():
    args_dict = {
        "config_file": "configs/combos/clip_emoberta.yaml",
        "name": "fold-2-twitter-ws-64-clip-emoberta-time2vec",
        "group": "experiments",
        "window_size": 64,
        "position_embeddings": "time2vec",
        "image_embeddings_type": "clip",
        "text_embeddings_type": "emoberta",
        "fold": 2,
        "batch_size": 256,
        "model": "multimodal-transformer",
    }


    args = SimpleNamespace(**args_dict)

    # Call load_args with the SimpleNamespace object
    return load_args(args)

def load_args(args):
    cfg = extend_config(cfg_path=f"{args.config_file}", child=None)

    for key, value in cfg.items():
        if not hasattr(args, key) or getattr(args, key) is None:
            setattr(args, key, value)

    return args, cfg

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def process_inputs(inputs, model, args, embs_type):
    device = next(model.parameters()).device

    # Ensure inputs list length matches window_size
    window_size = args.window_size
    seq_len = len(inputs)

    # Adjust inputs to match window_size
    if seq_len < window_size:
        num_padding = window_size - seq_len
        padding_inputs = [{'text': None, 'image': None, 'timestamp': 0.0} for _ in range(num_padding)]
        inputs.extend(padding_inputs)
    elif seq_len > window_size:
        inputs = inputs[:window_size]

    # Now, seq_len == window_size
    texts = []
    text_indices = []
    images = []
    image_indices = []
    timestamps = []

    for idx, input_item in enumerate(inputs):
        timestamps.append(input_item['timestamp'])

        if 'text' in input_item and input_item['text'] is not None:
            texts.append(input_item['text'])
            text_indices.append(idx)

        if 'image' in input_item and input_item['image'] is not None:
            images.append(input_item['image'])
            image_indices.append(idx)

    # Process text embeddings
    if len(texts) > 0:
        text_config = embs_type['text'][args.text_embeddings_type]
        model_name = text_config['model_name']

        if args.text_embeddings_type in ['roberta', 'emoberta']:
            text_encoder = SentenceTransformer(model_name).to(device)
            text_embeddings_list = text_encoder.encode(texts, convert_to_tensor=True)
        else:
            raise ValueError(f"Unsupported text embedding type: {args.text_embeddings_type}")

        # Get the actual embedding dimension
        text_embedding_dim = text_embeddings_list.shape[-1]
        # Initialize text_embeddings with the correct dimension
        text_embeddings = torch.zeros((window_size, text_embedding_dim), device=device)
        text_mask = torch.zeros((1, 1, window_size), device=device)

        # Place embeddings into the tensor
        for idx, emb in zip(text_indices, text_embeddings_list):
            text_embeddings[idx] = emb
            text_mask[0, 0, idx] = 1
    else:
        # If no text embeddings, initialize with zeros of expected dimension
        text_embedding_dim = args.TEXT_EMBEDDING_SIZES[args.text_embeddings_type]
        text_embeddings = torch.zeros((window_size, text_embedding_dim), device=device)
        text_mask = torch.zeros((1, 1, window_size), device=device)

    # Process image embeddings
    if len(images) > 0:
        image_config = embs_type['image'][args.image_embeddings_type]
        image_model_name = image_config['model_name']
        image_model_class = image_config['model_class']
        image_input_representation = image_config['input_representation']
        image_processor = image_input_representation.from_pretrained(image_model_name)
        image_model = image_model_class.from_pretrained(image_model_name).to(device)

        image_inputs = image_processor(images=images, return_tensors="pt").to(device)
        with torch.no_grad():
            if args.image_embeddings_type == 'clip':
                image_outputs = image_model(**image_inputs)
                image_embeddings_list = image_outputs.last_hidden_state.mean(dim=1)
            else:
                raise ValueError(f"Unsupported image embedding type: {args.image_embeddings_type}")

        # Get the actual embedding dimension
        image_embedding_dim = image_embeddings_list.shape[-1]
        # Initialize image_embeddings with the correct dimension
        image_embeddings = torch.zeros((window_size, image_embedding_dim), device=device)
        image_mask = torch.zeros((1, 1, window_size), device=device)

        # Place embeddings into the tensor
        for idx, emb in zip(image_indices, image_embeddings_list):
            image_embeddings[idx] = emb
            image_mask[0, 0, idx] = 1
    else:
        # If no image embeddings, initialize with zeros of expected dimension
        image_embedding_dim = args.IMAGE_EMBEDDING_SIZES[args.image_embeddings_type]
        image_embeddings = torch.zeros((window_size, image_embedding_dim), device=device)
        image_mask = torch.zeros((1, 1, window_size), device=device)

    # Prepare time tensor
    time_tensor = torch.tensor(timestamps, dtype=torch.float32, device=device)
    time_tensor = time_tensor.view(-1, window_size)

    # Prepare the input sample
    sample = {
        'image_embeddings': image_embeddings.unsqueeze(0),  # Shape: (1, window_size, embedding_dim)
        'text_embeddings': text_embeddings.unsqueeze(0),    # Shape: (1, window_size, embedding_dim)
        'image_mask': image_mask,                           # Shape: (1, 1, window_size)
        'text_mask': text_mask,                             # Shape: (1, 1, window_size)
        'time': time_tensor,                                # Shape: (batch_size, window_size)
        'label': torch.tensor([0.0]),  # Dummy label
    }

    # Move sample to device
    for key in sample:
        sample[key] = sample[key].to(device)

    # Run the model
    with torch.no_grad():
        output = model(sample)
    return output


args, cfg = create_args_manually()
model = nomenclature.MODELS[args.model](args)
state_dict = load_model(args)
state_dict = {key.replace("module.", ""): value for key, value in state_dict.items()}
model.load_state_dict(state_dict)
model.eval()
model = model.to(device)
print("Model loaded", "using cuda" if torch.cuda.is_available() else "using cpu")

# Create FastAPI app
async def init_session():
    return aiohttp.ClientSession()

async def startup_event():
    app.state.session = await init_session()

async def shutdown_event():
    await app.state.session.close()

app = FastAPI(on_startup=[startup_event], on_shutdown=[shutdown_event])
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:8081",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Entry(BaseModel):
    """
    Data model for an entry in the request body
    :param text: Optional[str] - The text content of the entry
    :param image: Optional[str] - The URL of the image in the entry
    :param timestamp: str - The timestamp of the entry (ISO 8601 format)
    """
    text: Optional[str] = None
    image: Optional[str] = None
    timestamp: str

class RequestBody(BaseModel):
    """
    Data model for the request body
    """
    data: List[Entry]

backend_endpoint = os.getenv("BACKEND_ENDPOINT") or "http://localhost:8000"

class ResponseBody(BaseModel):
    """
    Response body data model
    """
    logits: List[float]
    probas: List[float]

@app.post("/check", response_model=ResponseBody)
async def check(body: RequestBody):
    """
    This endpoint receives a list of entries, each containing a text, image URL, and timestamp.
    It processes the entries and returns the logits and probabilities of the model.
    """

    processed = []
    for data in body.data:
        print(data)
        timestamp = data.timestamp
        if timestamp.endswith('Z'):
            timestamp = timestamp[:-1] + '+00:00'
        item = {
            'timestamp': datetime.datetime.fromisoformat(timestamp).timestamp()
        }
        
        if data.text:
            item['text'] = data.text
        
        if data.image:
            if not data.image.startswith("http"):
                data.image = backend_endpoint + data.image
            try:
                # Fetch the image from the URL with timeout
                async with app.state.session.get(data.image) as response:
                    response.raise_for_status()
                    image_data = await response.read()  # This reads the entire response body as bytes

                # Open the image from the response content
                image = Image.open(BytesIO(image_data))
                item['image'] = image
            except aiohttp.ClientError as e:
                print(f"Error fetching image: {data.image}")
                print(f"Error details: {str(e)}")
                traceback.print_exc()
                continue
            except UnidentifiedImageError as e:
                print(f"Error opening image: {data.image}")
                print(f"Error details: {str(e)}")
                traceback.print_exc()
                continue
            except Exception as e:
                print(f"Unexpected error processing image: {data.image}")
                print(f"Error details: {str(e)}")
                traceback.print_exc()
                continue
        
        processed.append(item)
    output = process_inputs(processed, model, args, embs_type)
    print(output)
    return {
        "logits": output['logits'].cpu().numpy().tolist()[0],
        "probas": output['probas'].cpu().numpy().tolist()[0]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)