from celery import shared_task
from .models import Document
from tickets.models import Ticket
import time

@shared_task
def process_document(document_id):
    try:
        document = Document.objects.get(id=document_id)
        document.jira_status = 'PROCESSING'
        document.save()

        # TODO: Implement actual document processing and ticket generation
        # This is a placeholder that creates a sample ticket
        Ticket.objects.create(
            document=document,
            title='Sample Ticket',
            description='This is a sample ticket generated from the document.',
            priority='MEDIUM',
            estimate='2 hours'
        )

        document.jira_status = 'COMPLETED'
        document.save()

    except Exception as e:
        document.jira_status = 'FAILED'
        document.error_message = str(e)
        document.save() 