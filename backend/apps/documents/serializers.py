from rest_framework import serializers
from .models import Document
from apps.tickets.serializers import TicketSerializer

class DocumentSerializer(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True, read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'file_name', 'content', 'uploaded_at', 'jira_status', 'tickets', 'scope_summary', 'clarifying_questions']

    def create(self, validated_data):
        document = Document.objects.create(**validated_data)
        return document
