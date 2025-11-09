import pytest
from django.contrib.auth import get_user_model
from django.contrib.admin.sites import AdminSite
from django.core.management import call_command
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework import serializers as drf_serializers
import io

from apps.notes.admin import CategoryAdmin
from apps.notes.models import Category, Note
from apps.notes.serializers import CategorySerializer

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(
        email="test@example.com",
        username="test@example.com",
        password="testpassword123",
    )


@pytest.fixture
def other_user():
    return User.objects.create_user(
        email="other@example.com",
        username="other@example.com",
        password="password123",
    )


@pytest.fixture
def category(user):
    return Category.objects.create(
        name="Test Category",
        color="#EF9C66",
        user=user,
    )


@pytest.fixture
def note(user, category):
    return Note.objects.create(
        title='Test Note',
        content='This is a test note content.',
        category=category,
        user=user
    )


@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def admin_site():
    return AdminSite()


@pytest.mark.django_db
class TestCategoryAPI:
    def test_list_categories(self, authenticated_client, category):
        url = reverse("notes:category-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == category.name
        assert response.data[0]["slug"] == category.slug

    def test_create_category(self, authenticated_client):
        category_data = {
            "name": "New Category",
            "color": "#FCDC94",
        }
        url = reverse("notes:category-list")
        response = authenticated_client.post(url, category_data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == category_data["name"]
        created_category = Category.objects.get(name=category_data["name"])
        assert created_category.slug == response.data["slug"]

    def test_create_category_invalid_color(self, authenticated_client):
        category_data = {
            "name": "Invalid Category",
            "color": "invalid-color",
        }
        url = reverse("notes:category-list")
        response = authenticated_client.post(url, category_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "color" in response.data

    def test_update_category(self, authenticated_client, category):
        update_data = {"name": "Updated Category"}
        url = reverse("notes:category-detail", kwargs={"pk": category.id})
        response = authenticated_client.patch(url, update_data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == update_data["name"]

    def test_delete_category(self, authenticated_client, category):
        url = reverse("notes:category-detail", kwargs={"pk": category.id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Category.objects.filter(id=category.id).exists()

    def test_categories_require_authentication(self, api_client):
        url = reverse("notes:category-list")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_category_list_is_user_scoped(self, authenticated_client, category, other_user):
        Category.objects.create(name="Other Category", color="#123456", user=other_user)
        url = reverse("notes:category-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == category.name

    def test_category_serializer_color_validation_messages(self):
        serializer = CategorySerializer()
        with pytest.raises(drf_serializers.ValidationError):
            serializer.validate_color("FF00FF")

        with pytest.raises(drf_serializers.ValidationError):
            serializer.validate_color("#GGGGGG")

    def test_category_admin_notes_count(self, admin_site, category, note):
        admin = CategoryAdmin(Category, admin_site)
        assert admin.notes_count(category) == 1

    def test_slug_generated_per_user(self, user):
        # Test slug generation with automatic incrementing
        cat1 = Category.objects.create(name="My Slug", color="#FFFFFF", user=user)
        assert cat1.slug == "my-slug"
        
        # Create another category with same name would normally conflict, 
        # but the unique constraint is on (name, user), so use same base slug
        cat2 = Category.objects.create(name="My Slug!", color="#000000", user=user)
        # This should get slug "my-slug-1" since "my-slug" exists
        assert cat2.slug == "my-slug-1"
        
    def test_category_slug_collision_handling(self, user):
        # Test the slug collision resolution
        cat1 = Category.objects.create(name="Test", color="#FFFFFF", user=user)
        cat2 = Category.objects.create(name="Test!", color="#AAAAAA", user=user)
        cat3 = Category.objects.create(name="Test!!", color="#000000", user=user)
        
        assert cat1.slug == "test"
        assert cat2.slug == "test-1"
        assert cat3.slug == "test-2"

    def test_get_notes_for_category(self, authenticated_client, note, user, category):
        # Create another note in the same category
        Note.objects.create(
            title="Second Note",
            content="Second content",
            category=category,
            user=user
        )
        
        # Create a different category with a note
        other_category = Category.objects.create(
            name="Other", 
            color="#AAAAAA", 
            user=user
        )
        Note.objects.create(
            title="Other Note",
            content="Other content",
            category=other_category,
            user=user
        )
        
        # Get notes for the first category
        url = reverse("notes:category-notes", kwargs={"pk": category.id})
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        assert all(n["category_name"] == category.name for n in response.data)


@pytest.mark.django_db
class TestNoteAPI:
    def test_list_notes(self, authenticated_client, note):
        url = reverse("notes:note-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == note.title
        assert response.data[0]["category_slug"] == note.category.slug

    def test_create_note(self, authenticated_client, category):
        note_data = {
            "title": "New Note",
            "content": "This is a new note.",
            "category": str(category.id),
        }
        url = reverse("notes:note-list")
        response = authenticated_client.post(url, note_data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == note_data["title"]
        assert Note.objects.filter(title=note_data["title"]).exists()

    def test_create_note_invalid_category(self, authenticated_client, user):
        # Create another user's category
        other_user = User.objects.create_user(
            email="invalid@example.com",
            username="invalid@example.com",
            password="password123",
        )
        other_category = Category.objects.create(
            name="Other Category",
            color="#C8CFA0",
            user=other_user,
        )

        note_data = {
            "title": "Invalid Note",
            "content": "This note has invalid category.",
            "category": str(other_category.id),
        }
        url = reverse("notes:note-list")
        response = authenticated_client.post(url, note_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "category" in response.data

    def test_update_note(self, authenticated_client, note):
        update_data = {"title": "Updated Note Title"}
        url = reverse("notes:note-detail", kwargs={"pk": note.id})
        response = authenticated_client.patch(url, update_data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == update_data["title"]

    def test_delete_note(self, authenticated_client, note):
        url = reverse("notes:note-detail", kwargs={"pk": note.id})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Note.objects.filter(id=note.id).exists()

    def test_filter_notes_by_category(self, authenticated_client, note, user):
        # Create another category and note
        other_category = Category.objects.create(
            name="Other Category",
            color="#AAAAAA",
            user=user
        )
        Note.objects.create(
            title="Other Note",
            content="Content",
            category=other_category,
            user=user
        )

        url = reverse("notes:note-list")
        response = authenticated_client.get(url, {"category": note.category.id})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == note.title

    def test_search_notes_by_title(self, authenticated_client, note):
        url = reverse("notes:note-list")
        response = authenticated_client.get(url, {"search": "test"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == note.title

    def test_notes_require_authentication(self, api_client):
        url = reverse("notes:note-list")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_user_cannot_access_another_users_note(
        self, authenticated_client, note, other_user
    ):
        other_category = Category.objects.create(
            name="Private Category",
            color="#111111",
            user=other_user,
        )
        private_note = Note.objects.create(
            title="Private",
            content="secret",
            category=other_category,
            user=other_user,
        )

        url = reverse("notes:note-detail", kwargs={"pk": private_note.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestSeedCategoriesCommand:
    def test_seed_categories_creates_defaults(self, user):
        out = io.StringIO()
        call_command("seed_categories", email=user.email, stdout=out)
        assert Category.objects.filter(user=user).count() == 4
        assert "Successfully created" in out.getvalue()

    def test_seed_categories_is_idempotent(self, user):
        call_command("seed_categories", email=user.email)
        out = io.StringIO()
        call_command("seed_categories", email=user.email, stdout=out)
        assert "already exists" in out.getvalue()

    def test_seed_categories_missing_user(self):
        out = io.StringIO()
        call_command("seed_categories", email="missing@example.com", stdout=out)
        assert "does not exist" in out.getvalue()


@pytest.mark.django_db
class TestNoteModel:
    def test_note_preview(self, user, category):
        long_content = 'A' * 150  # Content longer than 100 characters
        note = Note.objects.create(
            title='Test Note',
            content=long_content,
            category=category,
            user=user
        )

        assert len(note.preview) == 103  # 100 chars + "..."
        assert note.preview.endswith('...')

    def test_note_preview_short_content(self, user, category):
        short_content = 'Short content'
        note = Note.objects.create(
            title='Test Note',
            content=short_content,
            category=category,
            user=user
        )

        assert note.preview == short_content

    def test_note_preview_empty_content(self, user, category):
        note = Note.objects.create(
            title='Test Note',
            content='',
            category=category,
            user=user
        )

        assert note.preview == "No content"

    def test_note_str_method(self, user, category):
        note = Note.objects.create(
            title='My Note',
            content='Content',
            category=category,
            user=user
        )
        
        assert str(note) == f"My Note - {category.name}"

    def test_category_str_method(self, user, category):
        assert str(category) == f"{category.name} ({user.email})"


@pytest.mark.django_db
class TestCategoryModel:
    def test_category_requires_user(self, user):
        # Test that category must have a user before saving
        category = Category(name="Test", color="#FFFFFF")
        
        with pytest.raises(ValueError) as exc_info:
            category.save()
        
        assert "must be associated with a user" in str(exc_info.value)
