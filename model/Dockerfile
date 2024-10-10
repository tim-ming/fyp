FROM nvidia/cuda:11.4.3-base-ubuntu20.04

ENV PATH="/root/miniconda3/bin:${PATH}"
ARG PATH="/root/miniconda3/bin:${PATH}"

RUN apt-get update && apt-get install -y \
    wget \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN wget \
    https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh \
    && mkdir /root/.conda \
    && bash Miniconda3-latest-Linux-x86_64.sh -b \
    && rm -f Miniconda3-latest-Linux-x86_64.sh

WORKDIR /app

# Create conda environment with Python 3.9
RUN conda create -n myenv python=3.9 -y

# Make RUN commands use the new environment
SHELL ["conda", "run", "-n", "myenv", "/bin/bash", "-c"]

COPY requirements.txt .

# Install pip requirements
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8001

# Activate conda environment and run the application
CMD ["conda", "run", "--no-capture-output", "-n", "myenv", "python", "run.py"]