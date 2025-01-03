from django.urls import path
from . import views

urlpatterns = [
    path('gitlab/callback/', views.gitlab_callback, name='gitlab-callback'),
    path('verify/', views.verify_token, name='verify-token'),
]