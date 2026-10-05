FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /srv

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py page.html ./

EXPOSE 8000

# --proxy-headers and --forwarded-allow-ips so the app sees the real client
# address behind Koyeb's edge; the rate limiter keys on it, and without these
# every request would appear to come from the proxy and share one bucket.
CMD ["sh", "-c", "exec uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]
