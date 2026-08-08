from rest_framework import generics, permissions
from .models import User
from .serializers import UserSerializer

class AdminUserListView(generics.ListAPIView):
    """
    GET /api/users/admin/
    List all registered users in the system (Admins only).
    """
    queryset = User.objects.all().order_by("-created_at")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
