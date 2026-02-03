FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install build tools and libraries
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     python3-dev \
#     libsndfile1 \
#     ffmpeg \
#     && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code
COPY . .

# Expose port
EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

