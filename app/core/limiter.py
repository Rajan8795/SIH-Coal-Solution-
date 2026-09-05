from slowapi import Limiter
from slowapi.util import get_remote_address

# In-memory limiter — single instance ke liye fine hai
limiter = Limiter(key_func=get_remote_address)