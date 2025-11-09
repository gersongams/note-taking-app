from django.contrib import admin

from .models import Category, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Admin interface for Category model.
    """

    list_display = ["name", "color", "user", "notes_count", "created_at"]
    list_filter = ["created_at", "user"]
    search_fields = ["name", "user__email"]
    readonly_fields = ["created_at", "updated_at"]

    def notes_count(self, obj):
        return obj.notes.count()

    notes_count.short_description = "Notes Count"


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    """
    Admin interface for Note model.
    """

    list_display = ["title", "category", "user", "created_at", "updated_at"]
    list_filter = ["category", "created_at", "updated_at", "user"]
    search_fields = ["title", "content", "user__email", "category__name"]
    readonly_fields = ["created_at", "updated_at", "preview"]
    raw_id_fields = ["user", "category"]

    fieldsets = (
        ("Note Information", {"fields": ("title", "content", "preview")}),
        ("Relationships", {"fields": ("user", "category")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
