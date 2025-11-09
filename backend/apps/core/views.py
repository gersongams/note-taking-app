from django.http import JsonResponse


def health_check(request):
    """
    Simple health check endpoint
    Returns 200 OK with status message
    """
    return JsonResponse({"status": "ok", "message": "Notes API is running"})
