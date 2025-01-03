from django.db import models

class Document(models.Model):
    file = models.FileField(upload_to='documents/', null=True, blank=True)
    file_name = models.CharField(max_length=255, default='untitled')
    content = models.TextField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    jira_status = models.CharField(
        max_length=20,
        choices=[
            ('UNPROCESSED', 'Unprocessed'), 
            ('PROCESSED', 'Processed'),
            ('PUSHED', 'Pushed'),
            ('FAILED', 'Failed'),
            ('ERROR', 'Error')
        ],
        default='UNPROCESSED'
    )
    scope_summary = models.TextField(null=True, blank=True)
    clarifying_questions = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.file_name} ({self.jira_status})"
