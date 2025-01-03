from django.contrib import admin
from .models import Document

# Register your models here.
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'jira_status', 'uploaded_at')
    search_fields = ('file_name', 'content')
    list_filter = ('jira_status', 'uploaded_at')
