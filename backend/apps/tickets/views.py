from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.documents.models import Document
from .models import Ticket
from .serializers import TicketSerializer
from .ai_service import generate_tickets_from_content

@api_view(['POST'])
def generate_tickets(request, document_id):
    try:
        print(f"Generating tickets for document {document_id}")
        document = Document.objects.get(pk=document_id)
        
        # Generate tickets
        tickets = generate_tickets_from_content(document)
        print(f"Generated {len(tickets)} tickets")
        
        # Verify tickets in database
        db_tickets = Ticket.objects.filter(document=document)
        print(f"Found {db_tickets.count()} tickets in database")
        
        serializer = TicketSerializer(tickets, many=True)
        return Response({
            'message': f'Generated {len(tickets)} tickets',
            'tickets': serializer.data
        })
    except Document.DoesNotExist:
        return Response(
            {'error': 'Document not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"Error in generate_tickets view: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def list_tickets(request, document_id):
    tickets = Ticket.objects.filter(document_id=document_id)
    serializer = TicketSerializer(tickets, many=True)
    return Response(serializer.data)