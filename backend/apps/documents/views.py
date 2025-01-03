from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer
import fitz
import os
from django.http import FileResponse
from jira import JIRA
from django.conf import settings
import gitlab
from apps.tickets.ai_service import generate_tickets_from_content, generate_scope_summary, generate_clarifying_questions

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def list(self, request):
        """Get all documents"""
        documents = self.get_queryset()
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Get a specific document"""
        try:
            document = self.get_object()
            serializer = self.get_serializer(document)
            return Response(serializer.data)
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['POST'])
    def upload(self, request):
        """Upload and process a document"""
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_obj = request.FILES['file']
        
        try:
            document = Document.objects.create(
                file=file_obj,
                file_name=file_obj.name,
                jira_status='UNPROCESSED'
            )
            
            if file_obj.name.endswith('.pdf'):
                try:
                    # Get the file path
                    file_path = document.file.path
                    print(f"Processing PDF: {file_path}")
                    
                    # Open and extract text with PyMuPDF
                    pdf_document = fitz.open(file_path)
                    content = ""
                    
                    for page_num in range(pdf_document.page_count):
                        page = pdf_document[page_num]
                        content += page.get_text() + "\n"
                    
                    pdf_document.close()
                    
                    print(f"Extracted content length: {len(content)}")
                    print(f"Content preview: {content[:200]}")

                    if content.strip():
                        # Save the content to document
                        document.content = content
                        document.save()
                        
                        # Generate tickets using your existing service
                        tickets = generate_tickets_from_content(document)

                        # Generate summary and clarifying questions
                        summary = generate_scope_summary(document)
                        questions = generate_clarifying_questions(document)
                        
                        # Save the summary and questions to the document
                        document.scope_summary = summary
                        document.save()
                        document.clarifying_questions = questions
                        document.save()
                        
                        document.jira_status = 'PROCESSED'
                        document.save()
                        
                        return Response({
                            'id': document.id,
                            'message': 'Content extracted and tickets generated successfully',
                            'jira_status': document.jira_status,
                            'tickets_count': len(tickets),
                            'content_preview': content[:500] + '...' if len(content) > 500 else content
                        }, status=status.HTTP_201_CREATED)
                        
                    else:
                        return Response({
                            'id': document.id,
                            'message': 'PDF uploaded but no text content extracted',
                            'jira_status': 'ERROR'
                        }, status=status.HTTP_201_CREATED)
                        
                        
                except Exception as pdf_error:
                    print(f"PDF extraction error: {str(pdf_error)}")
                    return Response({
                        'id': document.id,
                        'message': f'PDF upload successful but extraction failed: {str(pdf_error)}',
                        'jira_status': 'ERROR'
                    }, status=status.HTTP_201_CREATED)
            
            return Response({
                'id': document.id,
                'message': 'Document uploaded successfully',
                'jira_status': document.jira_status
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Upload error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['GET'])
    def content(self, request, pk=None):
        """Get document content"""
        document = self.get_object()
        return Response({
            'id': document.id,
            'file_name': document.file_name,
            'content': document.content,
            'jira_status': document.jira_status
        })

    @action(detail=True, methods=['GET'], url_path='view')
    def view_pdf(self, request, pk=None):
        """View the PDF document"""
        document = self.get_object()
        file_path = document.file.path
        
        if os.path.exists(file_path):
            return FileResponse(
                open(file_path, 'rb'),
                content_type='application/pdf'
            )
        
        return Response(
            {'error': 'PDF file not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=True, methods=['POST'], url_path='push-to-jira')
    def push_to_jira_and_gitlab(self, request, pk=None):
        document = self.get_object()
        
        try:
            # Get project keys from request
            jira_project = request.data.get('project_key')
            gitlab_project_id = request.data.get('gitlab_project_id')
            
            # Initialize clients
            jira = JIRA(
                server=settings.JIRA_URL,
                basic_auth=(settings.JIRA_EMAIL, settings.JIRA_API_TOKEN)
            )
            
            gl = gitlab.Gitlab(
                settings.GITLAB_URL, 
                private_token=settings.GITLAB_TOKEN
            )
            gitlab_project = gl.projects.get(gitlab_project_id)
            
            # Create tickets/issues
            for ticket in document.tickets.all():
                # Create Jira issue
                jira_issue = jira.create_issue(
                    project=jira_project,
                    summary=ticket.title,
                    description=ticket.description,
                    issuetype={'name': 'Task'}
                )
                
                # Create GitLab issue
                gitlab_issue = gitlab_project.issues.create({
                    'title': ticket.title,
                    'description': f"{ticket.description}\n\nJira Reference: {jira_issue.key}",
                    'labels': [ticket.priority.lower()]
                })
                
                print(f"Created Jira issue: {jira_issue.key}")
                print(f"Created GitLab issue: #{gitlab_issue.iid}")
            
            document.jira_status = 'PUSHED'
            document.save()
            
            return Response({
                'status': 'success',
                'message': 'Successfully pushed to Jira and GitLab'
            })
            
        except Exception as e:
            print(f"Push Error: {str(e)}")
            document.jira_status = 'FAILED'
            document.save()
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    @action(detail=False, methods=['GET'], url_path='jira-projects')
    def jira_projects(self, request):
        """Get available Jira projects"""
        try:
            jira = JIRA(
                server=settings.JIRA_URL,
                basic_auth=(settings.JIRA_EMAIL, settings.JIRA_API_TOKEN)
            )
            projects = jira.projects()
            
            return Response([{
                'value': project.key,
                'label': project.name
            } for project in projects])

            # temp
            # return Response([
            # {
            #     'value': 'TEST',
            #     'label': 'Test Project'
            # },
            # {
            #     'value': 'TEST2',
            #     'label': 'Test Project 2'
            # }
            # ])
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=False, methods=['GET'], url_path='gitlab-projects')
    def gitlab_projects(self, request):
        """Get available GitLab projects"""
        print("\n=== Starting GitLab Projects Fetch ===")
        print(f"GitLab URL: {settings.GITLAB_URL}")
        print(f"Token exists: {bool(settings.GITLAB_TOKEN)}")
        print(f"Token preview: {settings.GITLAB_TOKEN[:4]}..." if settings.GITLAB_TOKEN else "No token")
        
        try:
            print("\nInitializing GitLab client...")
            gl = gitlab.Gitlab(
                url=settings.GITLAB_URL,
                private_token=settings.GITLAB_TOKEN,
                per_page=100,
                api_version='4'
            )
            
            print("\nAttempting authentication...")
            gl.auth()
            print("Authentication successful!")
            
            print("\nFetching projects...")
            projects = gl.projects.list(membership=True, all=True)
            print(f"Found {len(projects)} projects")
            
            for project in projects[:3]:  # Print first 3 projects for debugging
                print(f"\nProject found: {project.path_with_namespace}")
                print(f"Project ID: {project.id}")
            
            response_data = [{
                'value': str(project.id),
                'label': project.path_with_namespace
            } for project in projects]
            
            print(f"\nReturning {len(response_data)} projects")
            return Response(response_data)
            
        except gitlab.exceptions.GitlabAuthenticationError as e:
            print(f"\n❌ GitLab Authentication Error: {str(e)}")
            print("Token used:", settings.GITLAB_TOKEN[:4] + "..." if settings.GITLAB_TOKEN else None)
            return Response(
                {'error': 'Invalid GitLab credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            print(f"\n❌ Unexpected GitLab Error: {str(e)}")
            print(f"Error type: {type(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )