"""
URL configuration for notes project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from apps.core.views import health_check

urlpatterns = [
    # Health check
    path('', health_check, name='health-check'),
    
    # Admin
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/auth/', include('apps.authentication.urls')),
    path('api/notes/', include('apps.notes.urls')),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Add debug toolbar in development
if settings.DEBUG and 'debug_toolbar' in settings.INSTALLED_APPS:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns