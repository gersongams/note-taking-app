from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'notes'

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'notes', views.NoteViewSet, basename='note')

urlpatterns = [
    path('', include(router.urls)),
]