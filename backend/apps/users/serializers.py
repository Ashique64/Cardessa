from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    """
    Custom registration serializer for dj-rest-auth.
    Uses email + name (no username field since our User model doesn't have one).
    """
    email = serializers.EmailField(required=True)
    name = serializers.CharField(max_length=255, required=True)
    password1 = serializers.CharField(write_only=True, style={"input_type": "password"})
    password2 = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate_email(self, email):
        email = email.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate(self, data):
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return data

    def get_cleaned_data(self):
        return {
            "email": self.validated_data.get("email", ""),
            "name": self.validated_data.get("name", ""),
            "password1": self.validated_data.get("password1", ""),
        }

    def save(self, request):
        self.is_valid(raise_exception=True)
        data = self.get_cleaned_data()
        user = User.objects.create_user(
            email=data["email"],
            name=data["name"],
            password=data["password1"],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for returning user details."""
    class Meta:
        model = User
        fields = ["id", "email", "name", "created_at"]
        read_only_fields = fields
