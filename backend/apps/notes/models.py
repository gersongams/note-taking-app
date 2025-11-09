from django.conf import settings
from django.db import models
from django.utils.text import slugify

from apps.core.models import BaseModel


class Category(BaseModel):
    """
    Model for note categories.
    """

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=150)
    color = models.CharField(max_length=7, help_text="Hex color code (e.g., #EF9C66)")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories"
    )

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ["name", "user"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "slug"], name="unique_category_slug_per_user"
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.user.email})"

    def save(self, *args, **kwargs):
        """
        Generate a per-user unique slug from the category name.
        """
        if not self.user_id:
            raise ValueError("Category must be associated with a user before saving.")

        base_slug = slugify(self.name) or "category"
        slug = base_slug
        counter = 1

        Model = self.__class__
        while (
            Model.objects.filter(user=self.user, slug=slug).exclude(pk=self.pk).exists()
        ):
            slug = f"{base_slug}-{counter}"
            counter += 1

        self.slug = slug
        super().save(*args, **kwargs)


class Note(BaseModel):
    """
    Model for notes.
    """

    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="notes"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notes"
    )

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return f"{self.title} - {self.category.name}"

    @property
    def preview(self):
        """
        Return a preview of the note content (first 100 characters).
        """
        if self.content:
            return (
                self.content[:100] + "..." if len(self.content) > 100 else self.content
            )
        return "No content"
