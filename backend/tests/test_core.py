import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.core.models import BaseModel


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestCoreViews:
    def test_health_check(self, api_client):
        """Test the health check endpoint"""
        url = reverse("health-check")
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["status"] == "ok"
        assert "message" in response.json()


class DummyBaseModel(BaseModel):
    class Meta:
        app_label = "tests"


def test_base_model_str_includes_class_and_id():
    instance = DummyBaseModel()
    text = str(instance)
    assert "DummyBaseModel" in text
    assert "(" in text and ")" in text
