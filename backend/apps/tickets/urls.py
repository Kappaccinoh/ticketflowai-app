from django.urls import path
from . import views

urlpatterns = [
    path('generate/<int:document_id>/', views.generate_tickets, name='generate_tickets'),
    path('document/<int:document_id>/', views.list_tickets, name='list_tickets'),
]