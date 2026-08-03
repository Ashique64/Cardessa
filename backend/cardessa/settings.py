"""
Cardessa Django Settings
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY", "unsafe-dev-secret-key")

DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # sites framework — required by allauth to bind OAuth credentials to a domain
    "django.contrib.sites",
    # Third-party
    "rest_framework",
    "corsheaders",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",   # Google OAuth provider
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "storages",
    # Cardessa apps
    "apps.users",
    "apps.templates_app",
    "apps.invitations",
    "apps.orders",
    "apps.media",
]

SITE_ID = 1

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "cardessa.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "cardessa.wsgi.application"

# Database — Fallback to SQLite in local development if requested or if using placeholders
db_host = os.getenv("DB_HOST", "localhost")
use_local_sqlite = os.getenv("USE_LOCAL_SQLITE", "True") == "True"

if DEBUG and (use_local_sqlite or db_host == "your-db-host.db.ondigitalocean.com"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "cardessa"),
            "USER": os.getenv("DB_USER", "cardessa_user"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": db_host,
            "PORT": os.getenv("DB_PORT", "5432"),
            "OPTIONS": {
                "sslmode": "require" if not DEBUG else "disable",
            },
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalisation
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Custom user model
AUTH_USER_MODEL = "users.User"

# ─── Django REST Framework ─────────────────────────────────────────────────────
# JWT is used instead of session/token auth because:
#   - Frontend (Vercel) and backend (DigitalOcean) are on separate domains
#   - JWT Bearer tokens work cleanly across origins
#   - Stateless: no DB lookup on every authenticated request
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# ─── SimpleJWT configuration ──────────────────────────────────────────────────
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,       # issue new refresh token on each refresh
    "BLACKLIST_AFTER_ROTATION": False,   # set True if you add token blacklist app
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ─── dj-rest-auth ─────────────────────────────────────────────────────────────
REST_AUTH = {
    "USE_JWT": True,                     # use JWT instead of DRF token
    "JWT_AUTH_COOKIE": None,             # no cookie — send token in Authorization header
    "JWT_AUTH_REFRESH_COOKIE": None,
    "SESSION_LOGIN": False,
    "TOKEN_MODEL": None,                 # disable DRF authtoken model — not needed with JWT
    "REGISTER_SERIALIZER": "apps.users.serializers.RegisterSerializer",
    "USER_DETAILS_SERIALIZER": "apps.users.serializers.UserSerializer",
}

# ─── allauth / Google OAuth ───────────────────────────────────────────────────
ACCOUNT_EMAIL_VERIFICATION = "none"   # set to 'mandatory' in production with email backend
# allauth v65+ API
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = None   # our User model has no username field

# Social account settings for Google OAuth
# The actual Client ID / Secret are stored in the database (django_socialapp table)
# via Django admin → Social Applications. These env vars provide them at startup
# so you can seed the DB from environment variables without manual admin steps.
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APP": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID", ""),
            "secret": os.getenv("GOOGLE_CLIENT_SECRET", ""),
            "key": "",
        },
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"access_type": "online"},
        # Only allow verified Google email addresses
        "VERIFIED_EMAIL": True,
    }
}

SOCIALACCOUNT_EMAIL_AUTHENTICATION = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = os.getenv(
    "CORS_ALLOWED_ORIGINS", "http://localhost:3000"
).split(",")
# Allow Authorization header for JWT
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "origin",
    "x-csrftoken",
]

# ─── DigitalOcean Spaces (media storage) ──────────────────────────────────────
if not DEBUG:
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

AWS_ACCESS_KEY_ID = os.getenv("DO_SPACES_KEY")
AWS_SECRET_ACCESS_KEY = os.getenv("DO_SPACES_SECRET")
AWS_STORAGE_BUCKET_NAME = os.getenv("DO_SPACES_BUCKET", "cardessa-media")
AWS_S3_REGION_NAME = os.getenv("DO_SPACES_REGION", "blr1")
AWS_S3_ENDPOINT_URL = os.getenv("DO_SPACES_ENDPOINT", "https://blr1.digitaloceanspaces.com")
AWS_S3_CUSTOM_DOMAIN = os.getenv("DO_SPACES_CDN_URL", "").replace("https://", "")
AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}
AWS_DEFAULT_ACL = "public-read"
MEDIA_URL = f"{os.getenv('DO_SPACES_CDN_URL', '')}/"

# local media in dev
if DEBUG:
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"

# ─── Razorpay ─────────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

# ─── AI Text Writer (Phase 3) ─────────────────────────────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
