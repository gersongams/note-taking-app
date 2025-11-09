import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework import serializers as drf_serializers

from apps.authentication.serializers import UserLoginSerializer

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_data():
    return {
        "email": "test@example.com",
        "password": "testpassword123",
    }


@pytest.fixture
def user(user_data):
    return User.objects.create_user(
        email=user_data["email"],
        username=user_data["email"],
        password=user_data["password"]
    )


@pytest.mark.django_db
class TestUserRegistration:
    def test_register_user_success(self, api_client, user_data):
        from apps.notes.models import Category
        
        url = reverse("authentication:register")
        response = api_client.post(url, user_data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert "user" in response.data
        assert "tokens" in response.data
        assert response.data["user"]["email"] == user_data["email"]
        persisted_user = User.objects.get(email=user_data["email"])
        assert persisted_user.check_password(user_data["password"])
        
        # Verify default categories were created
        categories = Category.objects.filter(user=persisted_user)
        assert categories.count() == 4
        category_names = [cat.name for cat in categories]
        assert "Random Thoughts" in category_names
        assert "Work" in category_names
        assert "Personal" in category_names
        assert "Ideas" in category_names

    def test_register_user_duplicate_email(self, api_client, user_data, user):
        url = reverse("authentication:register")
        response = api_client.post(url, user_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_user_str_returns_email(self, user):
        assert str(user) == user.email


@pytest.mark.django_db
class TestUserLogin:
    def test_login_success(self, api_client, user):
        login_data = {
            "email": user.email,
            "password": "testpassword123",
        }
        url = reverse("authentication:login")
        response = api_client.post(url, login_data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "user" in response.data
        assert "tokens" in response.data
        assert response.data["user"]["email"] == user.email

    def test_login_invalid_credentials(self, api_client, user):
        login_data = {
            "email": user.email,
            "password": "wrongpassword",
        }
        url = reverse("authentication:login")
        response = api_client.post(url, login_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_inactive_user(self, api_client, user):
        # Deactivate the user
        user.is_active = False
        user.save()
        
        login_data = {
            "email": user.email,
            "password": "testpassword123",
        }
        url = reverse("authentication:login")
        response = api_client.post(url, login_data, format="json")

        # For security, inactive users get same error as invalid credentials
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_missing_credentials(self, api_client):
        # Test missing email
        url = reverse("authentication:login")
        response = api_client.post(url, {"password": "test"}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Test missing password
        response = api_client.post(url, {"email": "test@example.com"}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserLoginSerializerBranches:
    def test_login_serializer_rejects_disabled_user(self, monkeypatch, user):
        user.is_active = False
        user.save()

        def fake_authenticate(**kwargs):
            return user

        monkeypatch.setattr(
            "apps.authentication.serializers.authenticate",
            fake_authenticate,
        )

        serializer = UserLoginSerializer(
            data={"email": user.email, "password": "testpassword123"},
            context={"request": None},
        )

        with pytest.raises(drf_serializers.ValidationError) as exc:
            serializer.is_valid(raise_exception=True)

        assert "disabled" in str(exc.value).lower()

    def test_login_serializer_requires_email_and_password(self):
        serializer = UserLoginSerializer(context={"request": None})
        with pytest.raises(drf_serializers.ValidationError) as exc:
            serializer.validate({})

        assert "must include" in str(exc.value).lower()
