from rest_framework import serializers
from .models import Category, Note


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model.
    """
    notes_count = serializers.SerializerMethodField()
    slug = serializers.SlugField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'color', 'notes_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_notes_count(self, obj):
        return obj.notes.count()

    def validate_color(self, value):
        """
        Validate that color is a valid hex color code.
        """
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError(
                "Color must be a valid hex color code (e.g., #EF9C66)"
            )

        try:
            int(value[1:], 16)
        except ValueError:
            raise serializers.ValidationError(
                "Color must be a valid hex color code"
            )

        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class NoteSerializer(serializers.ModelSerializer):
    """
    Serializer for Note model.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    preview = serializers.ReadOnlyField()

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'content', 'preview',
            'category', 'category_name', 'category_color', 'category_slug',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'preview']

    def validate_category(self, value):
        """
        Validate that category belongs to the authenticated user.
        """
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError(
                "You can only assign notes to your own categories."
            )
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class NoteListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing notes.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    preview = serializers.ReadOnlyField()

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'preview',
            'category_name', 'category_color', 'category_slug',
            'created_at', 'updated_at'
        ]
