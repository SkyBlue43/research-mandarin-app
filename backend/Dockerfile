# Use a Debian-based Python image with more preinstalled libraries
FROM python:3.11-bullseye

WORKDIR /app

# Copy dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


