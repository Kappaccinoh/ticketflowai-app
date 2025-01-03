from openai import OpenAI
from dotenv import load_dotenv
from .models import Ticket
import json
import os

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_tickets_from_content(document):
    """
    Generate tickets using OpenAI's API directly
    """
    try:
        print(f"Document content preview: {document.content[:200]}")

        prompt = f"""
        Create actionable tickets from this document content:
        
        {document.content[:4000]}
        
        Create 3-5 specific tickets. Return them in this exact JSON format:
        [
            {{
                "title": "Short, clear title",
                "description": "Detailed description of what needs to be done",
                "priority": "HIGH",
                "estimated_hours": 2.5
            }}
        ]
        
        Important: Return ONLY the JSON array, no other text.
        """

        print("Sending request to OpenAI...")
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a project manager who creates clear, actionable tickets from document content."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        result = response.choices[0].message.content
        print(f"Raw OpenAI Response: {result}")

        # Clean up the response
        result = result.strip()
        if result.startswith('```json'):
            result = result[7:]  # Remove ```json
        if result.startswith('```'):
            result = result[3:]  # Remove ```
        if result.endswith('```'):
            result = result[:-3]  # Remove trailing ```
        
        result = result.strip()
        print(f"Cleaned response: {result}")

        tickets_data = json.loads(result)
        print(f"Parsed tickets data: {tickets_data}")
        
        created_tickets = []
        for ticket_data in tickets_data:
            try:
                # Validate ticket data
                if not all(key in ticket_data for key in ['title', 'description']):
                    print(f"Skipping invalid ticket data: {ticket_data}")
                    continue

                # Create ticket with proper error handling
                ticket = Ticket.objects.create(
                    document=document,
                    title=ticket_data['title'][:200],
                    description=ticket_data['description'],
                    priority=ticket_data.get('priority', 'MEDIUM').upper(),
                    estimated_hours=float(ticket_data.get('estimated_hours', 0))
                )
                print(f"Created ticket: {ticket.id} - {ticket.title}")
                created_tickets.append(ticket)
            except Exception as e:
                print(f"Error creating ticket: {str(e)}")
                print(f"Problematic ticket data: {ticket_data}")

        print(f"Successfully created {len(created_tickets)} tickets")
        return created_tickets

    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {str(e)}")
        print(f"Raw response: {result}")
        return []
    except Exception as e:
        print(f"Error generating tickets: {str(e)}")
        print(f"Type of error: {type(e)}")
        return []

def process_crew_result(result):
    """
    Process the crew's result into a list of ticket dictionaries.
    """
    try:
        # Try to find JSON array in the result
        start_idx = result.find('[')
        end_idx = result.rfind(']') + 1
        
        if start_idx >= 0 and end_idx > start_idx:
            json_str = result[start_idx:end_idx]
            tickets_data = json.loads(json_str)
            
            # Validate and clean each ticket
            cleaned_tickets = []
            for ticket in tickets_data:
                if isinstance(ticket, dict) and 'title' in ticket and 'description' in ticket:
                    cleaned_ticket = {
                        'title': ticket['title'][:200],  # Limit title length
                        'description': ticket['description'],
                        'priority': ticket.get('priority', 'MEDIUM').upper(),
                        'estimated_hours': float(ticket.get('estimated_hours', 0))
                    }
                    cleaned_tickets.append(cleaned_ticket)
            
            return cleaned_tickets
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {str(e)}")
    except Exception as e:
        print(f"Error processing crew result: {str(e)}")
    
    return []

def generate_clarifying_questions(document):
    """
    Generate clarifying questions from document content
    """
    print("\n=== Starting Clarifying Questions Generation ===")
    print(f"Document content length: {len(document.content) if document.content else 'No content'}")
    
    try:
        prompt = f"""
        Review this document content and generate important clarifying questions:
        
        {document.content[:4000]}
        
        Create 3-5 specific questions that would help clarify requirements or potential ambiguities.
        For each question:
        1. What needs to be clarified?
        2. Why is this important?
        3. What impact could this have on the project?

        Write in a clear, natural format.
        """

        print("Sending request to OpenAI for questions...")
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a senior project manager who identifies potential risks and ambiguities in requirements."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        result = response.choices[0].message.content.strip()
        print(f"Raw OpenAI Response (Questions): {result[:200]}...")
        
        return result

    except Exception as e:
        print(f"❌ Error generating questions: {str(e)}")
        print(f"Error type: {type(e)}")
        return "Error generating clarifying questions"

def generate_scope_summary(document):
    """
    Generate a concise scope summary from document content
    """
    print("\n=== Starting Scope Summary Generation ===")
    print(f"Document content length: {len(document.content) if document.content else 'No content'}")
    
    try:
        prompt = f"""
        Create a concise project scope summary from this document:
        
        {document.content[:4000]}
        
        Include:
        1. Project Overview (2-3 sentences)
        2. Key Deliverables (bullet points)
        3. Major Constraints or Dependencies
        4. Out of Scope Items (if any)
        
        Write in a clear, natural format.
        """

        print("Sending request to OpenAI for scope summary...")
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a project manager who creates clear, concise scope summaries."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        result = response.choices[0].message.content.strip()
        print(f"Raw OpenAI Response (Scope): {result[:200]}...")
        print("Successfully generated scope summary")
        
        return result

    except Exception as e:
        print(f"❌ Error generating scope summary: {str(e)}")
        print(f"Error type: {type(e)}")
        return "Error generating scope summary"