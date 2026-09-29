import os
import sys

# Ensure VERCEL environment flag is set
os.environ["VERCEL"] = "1"

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app
