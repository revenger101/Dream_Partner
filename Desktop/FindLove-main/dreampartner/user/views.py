import datetime
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from .models import UserCredentials

from .models import COMPATIBILITY, Notification, UserProfile

from datetime import datetime
import json
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from .models import UserProfile
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from .models import Notification




COMPATIBILITY = {
    "Aries": ["Leo", "Sagittarius", "Gemini"],
    "Taurus": ["Virgo", "Capricorn", "Cancer"],
 
}

@csrf_exempt
@require_POST
def zodiac_compatibility_view(request):
    print("Request received")
    try:
        data = request.POST  
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        birthdate_str = data.get('birthdate')
        zodiac = data.get('zodiac')
        gender = data.get('gender')
        password = data.get('password')  
        profile_picture = request.FILES.get('profile_picture')  
        
        
        if UserProfile.objects.filter(email=email).exists():
            return JsonResponse({"error": "This email already exists. Please use a different one."}, status=400)

        if not (first_name and last_name and email and birthdate_str and zodiac and gender and password):
            return HttpResponseBadRequest("Missing required fields.")

        try:
            birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d").date()
        except ValueError:
            return HttpResponseBadRequest("Invalid birthdate format. Use YYYY-MM-DD.")

        # Hash the password before saving
        hashed_password = make_password(password)

        # Filter compatible users
        compatible_users = UserProfile.objects.filter(zodiac__in=COMPATIBILITY.get(zodiac, []))

        # Match based on gender preference
        if gender == "Female":
            compatible_users = compatible_users.filter(gender="Male")  
        elif gender == "Male":
            compatible_users = compatible_users.filter(gender="Female")  

        # Save profile picture if provided
        picture_url = None
        if profile_picture:
            file_name = f"profile_pictures/{email}_{profile_picture.name}"
            saved_path = default_storage.save(file_name, ContentFile(profile_picture.read()))
            picture_url = default_storage.url(saved_path)

        # Create user profile
        profile = UserProfile.objects.create(
            first_name=first_name,
            last_name=last_name,
            email=email,
            birthdate=birthdate,
            zodiac=zodiac,
            gender=gender,
            password=hashed_password,  # Save the hashed password
            picture=picture_url  # Save picture URL
        )

        # Prepare response data
        compatible_list = [
            {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "birthdate": user.birthdate.strftime("%Y-%m-%d") if user.birthdate else None,
                "zodiac": user.zodiac,
                "gender": user.gender,
                "profile_picture": user.picture.url if user.picture else None
            }
            for user in compatible_users
        ]

        return JsonResponse({
            "message": "Compatible users found!" if compatible_users.exists() else "No compatible users found.",
            "user_id": profile.id,
            "compatible_users": compatible_list
        })

    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON.")


@csrf_exempt
@require_POST
def select_compatible_user(request):
    try:
        data = json.loads(request.body)
        user_id, selected_user_id = data.get('user_id'), data.get('selected_user_id')

        if not user_id or not selected_user_id:
            return HttpResponseBadRequest("Both user_id and selected_user_id are required.")

        user, selected_user = UserProfile.objects.get(id=user_id), UserProfile.objects.get(id=selected_user_id)

        if selected_user.selected_match or selected_user.match_accepted:
            return HttpResponseBadRequest(f"{selected_user.first_name} is already matched.")
        if user.selected_match:
            return HttpResponseBadRequest(f"{user.first_name} has already selected someone.")

        user.selected_match = selected_user
        user.save()

        Notification.objects.create(receiver=selected_user, sender=user, message=f"{user.first_name} selected you!")
        return JsonResponse({"message": f"{user.first_name} selected {selected_user.first_name}."})
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON.")

@csrf_exempt
@require_POST
def accept_match(request):
    try:
        data = json.loads(request.body)
        user_id, match_id, accept = data.get('user_id'), data.get('match_id'), data.get('accept')

        if not user_id or not match_id:
            return HttpResponseBadRequest("Both user_id and match_id are required.")

        user, match = UserProfile.objects.get(id=user_id), UserProfile.objects.get(id=match_id)

        if accept:
            user.matches.add(match)
            match.matches.add(user)
            match.match_accepted = True
            match.save()
            message = f"{match.first_name} accepted your match!"
        else:
            match.selected_match = None
            match.match_accepted = False
            match.save()
            message = f"{match.first_name} rejected your match."

        Notification.objects.create(receiver=user, sender=match, message=message)
        return JsonResponse({"message": message})
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON.")

@csrf_exempt
def get_notifications(request, user_id):
    try:
        # Ensure the user exists
        user = UserProfile.objects.get(id=user_id)

        # Fetch unread notifications
        notifications = Notification.objects.filter(receiver_id=user_id, is_read=False)

        # Prepare response data with available fields
        notifications_data = [
            {
                "id": n.id,
                "message": n.message,
                "created_at": n.created_at.strftime("%Y-%m-%d %H:%M:%S"),  # Use created_at instead of timestamp
                "sender": {  # Include sender details
                    "id": n.sender.id,
                    "first_name": n.sender.first_name,
                    "last_name": n.sender.last_name,
                    "profile_picture": n.sender.picture.url if n.sender.picture else None,
                }
            }
            for n in notifications
        ]

        return JsonResponse({"notifications": notifications_data})
    except UserProfile.DoesNotExist:
        return JsonResponse({"error": "User does not exist."}, status=400)

@csrf_exempt
def get_possible_matches(request, user_id):
    try:
        user = UserProfile.objects.get(id=user_id)
        
        # Exclude rejected matches and already matched users
        unmatched_users = UserProfile.objects.exclude(
            id__in=user.rejected_matches.all()
        ).exclude(
            matches=user
        ).exclude(
            selected_match__isnull=False
        )

        # Filter by gender preference
        if user.gender == "Female":
            unmatched_users = unmatched_users.filter(gender="Male")
        elif user.gender == "Male":
            unmatched_users = unmatched_users.filter(gender="Female")
        
        return JsonResponse({"matches": list(unmatched_users.values("id", "first_name", "last_name"))})
    except UserProfile.DoesNotExist:
        return HttpResponseBadRequest("User does not exist.")



from django.http import JsonResponse
from user.models import UserProfile

def get_all_matches(request):
    matches = []
    
    all_users = UserProfile.objects.all()

    for user in all_users:
        if user.selected_match:
            status = "Pending"
            if user.match_accepted:
                status = "Accepted"
            elif user.match_accepted is False:
                status = "Rejected"
            
            matches.append({
                "user_id": user.id,
                "user_name": f"{user.first_name} {user.last_name}",
                "selected_match_id": user.selected_match.id,
                "selected_match_name": f"{user.selected_match.first_name} {user.selected_match.last_name}",
                "status": status
            })
    
    return JsonResponse({"matches": matches})



@csrf_exempt
def get_pending_requests(request, user_id):
    try:
        user = UserProfile.objects.get(id=user_id)
        pending_requests = user.get_pending_requests()
        return JsonResponse({
            "pending_requests": [
                {"id": req.id, "first_name": req.first_name, "last_name": req.last_name, "zodiac": req.zodiac}
                for req in pending_requests
            ]
        })
    except UserProfile.DoesNotExist:
        return HttpResponseBadRequest("User does not exist.")

@csrf_exempt
def signup(request):
    try:
        if request.method == "POST":
            data = json.loads(request.body)
            print("Signup Data:", data)
            name = data.get('name')
            email = data.get('email')
            password = data.get('password')

            if not name or not email or not password:
                return HttpResponseBadRequest("Name, email, and password are required.")

            if UserCredentials.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email is already in use."}, status=400)

            # Create a new user credential record
            user = UserCredentials(name=name, email=email)
            user.set_password(password)  # Set the hashed password
            user.save()

            return JsonResponse({"message": "User registered successfully."})

        return HttpResponseBadRequest("Invalid request method.")
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON.")
    
    
@csrf_exempt
def login(request):
    try:
        if request.method == "POST":
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            if not email or not password:
                return JsonResponse({"error": "Email and password are required."}, status=400)

            # Check if user exists
            try:
                user = UserProfile.objects.get(email=email)
            except UserProfile.DoesNotExist:
                return JsonResponse({"error": "Invalid email or password."}, status=400)

            # Verify password
            if not check_password(password, user.password):
                return JsonResponse({"error": "Invalid email or password."}, status=400)

            # Send user details in response
            response_data = {
                "message": "Login successful.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "profile_picture": user.picture.url if user.picture else None,  # Fix field name
                    "zodiac_sign": user.zodiac,  # Match field name
                    "birthday": user.birthdate.strftime("%Y-%m-%d") if user.birthdate else None,
                    "gender": user.gender,
                }
            }
            return JsonResponse(response_data)

        return JsonResponse({"error": "Invalid request method."}, status=405)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format."}, status=400)


@csrf_exempt
@require_POST
def accept_match(request, user_id, match_id):
    try:
        user = UserProfile.objects.get(id=user_id)
        match = UserProfile.objects.get(id=match_id)

        # Add the match to the user's accepted matches
        user.matches.add(match)
        user.save()

        # Remove the match from the possible matches list
        user.selected_match = None
        user.save()

        return JsonResponse({"message": "Match accepted successfully."})
    except UserProfile.DoesNotExist:
        return HttpResponseBadRequest("User or match does not exist.")


@csrf_exempt
def get_accepted_matches(request, user_id):
    try:
        user = UserProfile.objects.get(id=user_id)
        accepted_matches = user.matches.all()  # Fetch all accepted matches

        # Prepare the list of accepted matches
        matches_list = [
            {
                "id": match.id,
                "first_name": match.first_name,
                "last_name": match.last_name,
                "profile_picture": match.picture.url if match.picture else None,
            }
            for match in accepted_matches
        ]

        return JsonResponse({"accepted_matches": matches_list})
    except UserProfile.DoesNotExist:
        return HttpResponseBadRequest("User does not exist.")
    


@csrf_exempt
@require_POST
def reject_match(request, user_id, match_id):
    try:
        user = UserProfile.objects.get(id=user_id)
        match = UserProfile.objects.get(id=match_id)

        # Add the rejected user to the rejected_matches list
        user.rejected_matches.add(match)
        user.save()

        # Notify the rejected user (optional)
        Notification.objects.create(
            receiver=match,
            sender=user,
            message=f"{user.first_name} has rejected your match."
        )

        return JsonResponse({"message": "Match rejected successfully."})
    except UserProfile.DoesNotExist:
        return JsonResponse({"error": "User or match does not exist."}, status=400)



@csrf_exempt
def mark_notification_as_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id)
        notification.is_read = True
        notification.save()
        return JsonResponse({"message": "Notification marked as read"})
    except Notification.DoesNotExist:
        return JsonResponse({"error": "Notification not found"}, status=404)


