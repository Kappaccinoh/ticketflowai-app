from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import requests
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def verify_token(request):
    # return Response({
    #     'isAuthenticated': True,
    #     'user': {
    #         'id': request.user.id,
    #         'email': request.user.email,
    #         'username': request.user.username,
    #     }
    # })
    return Response({
        'isAuthenticated': True,
        'user': {
            'id': 1,
            'email': 'test@example.com',
            'username': 'testuser',
            'avatar_url': 'https://gitlab.com/uploads/-/system/user/avatar/123/avatar.png'
        }
    })

User = get_user_model()

@api_view(['POST'])
def gitlab_callback(request):
    code = request.data.get('code')
    print(f"Received code: {code}")
    
    data = {
        'client_id': settings.GITLAB_CLIENT_ID,
        'client_secret': settings.GITLAB_CLIENT_SECRET,
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': settings.GITLAB_REDIRECT_URI
    }
    
    print("OAuth Request Data:", {  # Debug print
        'client_id': data['client_id'],
        'client_secret': data['client_secret'][:4] + '...',  # Show only first 4 chars
        'code': code,
        'redirect_uri': data['redirect_uri']
    })
    
    response = requests.post(
        'https://gitlab.com/oauth/token',
        data=data
    )

    print(f"GitLab Response:", response.text)  # Print full response

    if response.status_code == 200:
        access_token = response.json().get('access_token')
        # Get user info from GitLab
        user_response = requests.get(
            'https://gitlab.com/api/v4/user',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if user_response.status_code == 200:
            gitlab_user = user_response.json()
            
            # Create or update user
            user, created = User.objects.get_or_create(
                email=gitlab_user['email'],
                defaults={
                    'username': gitlab_user['username'],
                    'first_name': gitlab_user.get('name', '').split()[0],
                    'last_name': ' '.join(gitlab_user.get('name', '').split()[1:]),
                }
            )
            
            # Generate JWT token
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'token': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'gitlab_id': gitlab_user['id'],
                    'avatar_url': gitlab_user.get('avatar_url'),
                }
            })
    
    return Response({'error': 'Authentication failed'}, status=400)