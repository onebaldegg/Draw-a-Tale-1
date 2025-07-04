import requests
import sys
import uuid
import json
from datetime import datetime

class DrawATaleAPITester:
    def __init__(self, base_url="https://0ea8cde4-993b-452f-8956-b2ca7c1533b1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_data = None
        self.drawing_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health endpoint"""
        return self.run_test(
            "API Health Check",
            "GET",
            "health",
            200
        )

    def test_register(self, email="test_rainbow@example.com", username="rainbow_tester", password="Rainbow123!"):
        """Test user registration with specific test user for rainbow effects testing"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": email,
                "username": username,
                "password": password,
                "user_type": "child",
                "age": 8
            }
        )
        
        if success:
            self.user_data = response
            print(f"Created test user: {username} with email: {email}")
        
        return success, response

    def test_login(self, email="test_rainbow@example.com", password="Rainbow123!"):
        """Test user login with specific test user for rainbow effects testing"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": email,
                "password": password
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"✅ Successfully logged in and got token")
            return True, response
        
        return False, {}

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.token:
            print("❌ Cannot test user info without token")
            return False, {}
            
        return self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )

    def test_get_quests(self):
        """Test getting quests"""
        return self.run_test(
            "Get Quests",
            "GET",
            "quests",
            200
        )
        
    def test_create_drawing(self, title="Test Poop Drawing"):
        """Test creating a drawing with a simple canvas_data structure"""
        if not self.token:
            print("❌ Cannot create drawing without token")
            return False, {}
            
        # Create a simple drawing with SVG data
        canvas_data = {
            "svg": '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><circle cx="100" cy="100" r="50" fill="brown"/><text x="100" y="110" text-anchor="middle" fill="white">poop</text></svg>',
            "paperjs": "[\"Path\",{\"segments\":[[100,100],[150,100],[150,150],[100,150]],\"closed\":true,\"fillColor\":[0,0,0]}]",
            "thumbnail": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjUwIiBmaWxsPSJicm93biIvPjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+cG9vcDwvdGV4dD48L3N2Zz4=",
            "width": 800,
            "height": 600
        }
        
        drawing_data = {
            "title": title,
            "description": "A test drawing of poop",
            "canvas_data": canvas_data,
            "time_lapse": [
                {
                    "timestamp": datetime.now().timestamp() * 1000,
                    "action": "start",
                    "tool": "pencil",
                    "color": "#8B4513",
                    "size": 5,
                    "point": {"x": 100, "y": 100}
                },
                {
                    "timestamp": datetime.now().timestamp() * 1000 + 1000,
                    "action": "stop",
                    "state": "[\"Path\",{\"segments\":[[100,100],[150,100],[150,150],[100,150]],\"closed\":true,\"fillColor\":[0,0,0]}]"
                }
            ]
        }
        
        success, response = self.run_test(
            "Create Drawing",
            "POST",
            "drawings",
            200,
            data=drawing_data
        )
        
        if success and 'id' in response:
            self.drawing_id = response['id']
            print(f"✅ Successfully created drawing with ID: {self.drawing_id}")
            print(f"Canvas data structure: {json.dumps(response['canvas_data'], indent=2)}")
        
        return success, response
        
    def test_get_drawings(self):
        """Test getting all user drawings"""
        if not self.token:
            print("❌ Cannot get drawings without token")
            return False, {}
            
        success, response = self.run_test(
            "Get User Drawings",
            "GET",
            "drawings",
            200
        )
        
        if success:
            print(f"✅ Retrieved {len(response)} drawings")
            # Print details about each drawing's canvas_data structure
            for i, drawing in enumerate(response):
                print(f"\nDrawing {i+1}: {drawing['title']}")
                print(f"Canvas data keys: {list(drawing['canvas_data'].keys()) if 'canvas_data' in drawing else 'No canvas_data'}")
                if 'canvas_data' in drawing and 'svg' in drawing['canvas_data']:
                    svg_length = len(drawing['canvas_data']['svg'])
                    print(f"SVG data length: {svg_length} characters")
                    print(f"SVG data preview: {drawing['canvas_data']['svg'][:100]}...")
        
        return success, response
        
    def test_get_drawing(self):
        """Test getting a specific drawing"""
        if not self.token or not self.drawing_id:
            print("❌ Cannot get specific drawing without token or drawing ID")
            return False, {}
            
        success, response = self.run_test(
            "Get Specific Drawing",
            "GET",
            f"drawings/{self.drawing_id}",
            200
        )
        
        if success:
            print(f"✅ Retrieved drawing: {response['title']}")
            print(f"Canvas data structure: {json.dumps(response['canvas_data'], indent=2)}")
        
        return success, response
    
    def test_delete_drawing_unauthorized(self):
        """Test deleting a drawing without authentication"""
        # Save the current token
        saved_token = self.token
        self.token = None
        
        # Create a random drawing ID that likely doesn't exist
        random_drawing_id = str(uuid.uuid4())
        
        success, response = self.run_test(
            "Delete Drawing Without Authentication",
            "DELETE",
            f"drawings/{random_drawing_id}",
            401  # Expect 401 Unauthorized
        )
        
        # Restore the token
        self.token = saved_token
        return success, response
    
    def test_delete_nonexistent_drawing(self):
        """Test deleting a drawing that doesn't exist"""
        if not self.token:
            print("❌ Cannot test deleting nonexistent drawing without token")
            return False, {}
        
        # Create a random drawing ID that likely doesn't exist
        random_drawing_id = str(uuid.uuid4())
        
        return self.run_test(
            "Delete Nonexistent Drawing",
            "DELETE",
            f"drawings/{random_drawing_id}",
            404  # Expect 404 Not Found
        )
    
    def test_delete_drawing(self):
        """Test deleting a drawing"""
        if not self.token or not self.drawing_id:
            print("❌ Cannot delete drawing without token or drawing ID")
            return False, {}
        
        success, response = self.run_test(
            "Delete Drawing",
            "DELETE",
            f"drawings/{self.drawing_id}",
            200  # Expect 200 OK
        )
        
        if success:
            print(f"✅ Successfully deleted drawing with ID: {self.drawing_id}")
            
            # Verify the drawing is actually deleted by trying to get it
            verify_success, _ = self.run_test(
                "Verify Drawing Deletion",
                "GET",
                f"drawings/{self.drawing_id}",
                404  # Expect 404 Not Found
            )
            
            if verify_success:
                print("✅ Verified drawing was actually deleted")
            else:
                print("❌ Drawing still exists after deletion")
                success = False
        
        return success, response

def main():
    # Setup
    tester = DrawATaleAPITester()
    
    # Run tests
    print("\n===== TESTING BACKEND API =====")
    
    health_success, _ = tester.test_health_check()
    if not health_success:
        print("❌ API health check failed, stopping tests")
        return 1
    
    # Try to login with the test user first (in case it already exists)
    login_success, _ = tester.test_login()
    
    # If login fails, try to register the user
    if not login_success:
        print("Login failed, attempting to register the test user...")
        register_success, _ = tester.test_register()
        if not register_success:
            print("❌ Registration failed, stopping tests")
            return 1
            
        # Try login again after registration
        login_success, _ = tester.test_login()
        if not login_success:
            print("❌ Login failed after registration, stopping tests")
            return 1
    
    user_success, _ = tester.test_get_current_user()
    if not user_success:
        print("❌ Getting user info failed")
        
    quests_success, _ = tester.test_get_quests()
    if not quests_success:
        print("❌ Getting quests failed")
    
    # Test drawings API - this is what we're debugging
    print("\n===== TESTING DRAWINGS API =====")
    
    # Create a test drawing
    create_drawing_success, _ = tester.test_create_drawing()
    if not create_drawing_success:
        print("❌ Creating drawing failed")
    
    # Get all drawings
    get_drawings_success, _ = tester.test_get_drawings()
    if not get_drawings_success:
        print("❌ Getting drawings failed")
    
    # Get specific drawing
    if tester.drawing_id:
        get_drawing_success, _ = tester.test_get_drawing()
        if not get_drawing_success:
            print("❌ Getting specific drawing failed")
    
    # Test DELETE endpoint
    print("\n===== TESTING DELETE ENDPOINT =====")
    
    # Test deleting without authentication
    delete_unauth_success, _ = tester.test_delete_drawing_unauthorized()
    if not delete_unauth_success:
        print("❌ Delete drawing without authentication test failed")
    
    # Test deleting nonexistent drawing
    delete_nonexistent_success, _ = tester.test_delete_nonexistent_drawing()
    if not delete_nonexistent_success:
        print("❌ Delete nonexistent drawing test failed")
    
    # Create a new drawing specifically for deletion test
    if tester.token:
        print("\nCreating a new drawing for deletion test...")
        create_for_delete_success, _ = tester.test_create_drawing(title="Drawing to Delete")
        if create_for_delete_success and tester.drawing_id:
            # Test deleting the drawing
            delete_success, _ = tester.test_delete_drawing()
            if not delete_success:
                print("❌ Delete drawing test failed")
        else:
            print("❌ Could not create drawing for deletion test")

    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print("\nBackend API testing complete.")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())