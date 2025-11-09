from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.notes.models import Category

User = get_user_model()


class Command(BaseCommand):
    help = "Create initial categories for testing"

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            help="Email of the user to create categories for",
            required=True,
        )

    def handle(self, *args, **options):
        email = options["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f"User with email {email} does not exist")
            )
            return

        # Default categories
        default_categories = [
            {"name": "Personal", "color": "#78ABA8"},  # Teal
            {"name": "Work", "color": "#EF9C66"},  # Orange
            {"name": "School", "color": "#FCDC94"},  # Yellow
            {"name": "Random Thoughts", "color": "#C8CFA0"},  # Green
        ]

        created_count = 0
        for cat_data in default_categories:
            category, created = Category.objects.get_or_create(
                user=user, name=cat_data["name"], defaults={"color": cat_data["color"]}
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created category: {category.name} ({category.slug})"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"Category already exists: {category.name} ({category.slug})"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully created {created_count} new categories for {user.email}"
            )
        )
