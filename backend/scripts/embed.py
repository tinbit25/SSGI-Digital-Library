#!/usr/bin/env python3
import sys, json
from sentence_transformers import SentenceTransformer

def main():
    if len(sys.argv) < 2:
        print(json.dumps([]))
        sys.exit(0)
    text = sys.argv[1]
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    embedding = model.encode(text).tolist()
    print(json.dumps(embedding))

if __name__ == '__main__':
    main()
