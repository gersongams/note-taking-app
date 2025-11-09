from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from apps.notes.models import Category

from .serializers import UserLoginSerializer, UserRegistrationSerializer, UserSerializer


@extend_schema(
    operation_id="user_register",
    description="Register a new user account",
    request=UserRegistrationSerializer,
    responses={201: UserSerializer},
)
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user account.
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # Create default categories for the new user
        default_categories = [
            {"name": "Random Thoughts", "color": "#EF9C66"},
            {"name": "Work", "color": "#FCDC94"},
            {"name": "Personal", "color": "#C8CFA0"},
            {"name": "Ideas", "color": "#78ABA8"},
        ]

        for cat_data in default_categories:
            Category.objects.create(
                name=cat_data["name"], color=cat_data["color"], user=user
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        # Return user data with tokens
        user_serializer = UserSerializer(user)

        return Response(
            {
                "user": user_serializer.data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    operation_id="user_login",
    description="Login user and return tokens",
    request=UserLoginSerializer,
    responses={200: UserSerializer},
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    Login user and return tokens.
    """
    serializer = UserLoginSerializer(data=request.data, context={"request": request})

    if serializer.is_valid():
        user = serializer.validated_data["user"]

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        # Return user data with tokens
        user_serializer = UserSerializer(user)

        return Response(
            {
                "user": user_serializer.data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            }
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
