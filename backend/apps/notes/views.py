from django.db import models

from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Category, Note
from .serializers import CategorySerializer, NoteListSerializer, NoteSerializer


@extend_schema_view(
    list=extend_schema(description="List all categories for the authenticated user"),
    create=extend_schema(description="Create a new category"),
    retrieve=extend_schema(description="Retrieve a specific category"),
    update=extend_schema(description="Update a category"),
    partial_update=extend_schema(description="Partially update a category"),
    destroy=extend_schema(description="Delete a category"),
)
class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing categories.
    """

    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        """
        Return categories for the authenticated user only.
        """
        return Category.objects.filter(user=self.request.user)

    @extend_schema(
        description="Get notes for a specific category",
        responses={200: NoteListSerializer(many=True)},
    )
    @action(detail=True, methods=["get"])
    def notes(self, request, pk=None):
        """
        Get all notes for a specific category.
        """
        category = self.get_object()
        notes = Note.objects.filter(category=category)
        serializer = NoteListSerializer(notes, many=True)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(description="List all notes for the authenticated user"),
    create=extend_schema(description="Create a new note"),
    retrieve=extend_schema(description="Retrieve a specific note"),
    update=extend_schema(description="Update a note"),
    partial_update=extend_schema(description="Partially update a note"),
    destroy=extend_schema(description="Delete a note"),
)
class NoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notes.
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["category"]
    search_fields = ["title", "content"]
    ordering_fields = ["title", "created_at", "updated_at"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        """
        Return notes for the authenticated user only.
        """
        return Note.objects.filter(user=self.request.user).select_related("category")

    def get_serializer_class(self):
        """
        Return appropriate serializer based on action.
        """
        if self.action == "list":
            return NoteListSerializer
        return NoteSerializer
