"""
URL configuration for Cardessa project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # JWT auth endpoints (dj-rest-auth with USE_JWT=True)
    # POST /api/auth/login/            → returns { access, refresh }
    # POST /api/auth/logout/
    # POST /api/auth/token/refresh/    → returns new access token
    # GET  /api/auth/user/             → current user details
    path("api/auth/", include("dj_rest_auth.urls")),

    # Registration endpoint
    # POST /api/auth/register/         → { email, name, password1, password2 }
    path("api/auth/register/", include("dj_rest_auth.registration.urls")),

    # Google OAuth endpoint
    # POST /api/auth/google/           → { access_token } → returns { access, refresh }
    # The frontend obtains a Google OAuth token via the Google JS SDK / popup,
    # then sends it here to get a Cardessa JWT pair.
    path("api/auth/social/", include("allauth.socialaccount.urls")),

    # Cardessa API endpoints
    path("api/templates/", include("apps.templates_app.urls")),
    path("api/invitations/", include("apps.invitations.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/media/", include("apps.media.urls")),
    path("api/users/admin/", __import__("apps.users.views", fromlist=["AdminUserListView"]).AdminUserListView.as_view(), name="admin-users-list"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
