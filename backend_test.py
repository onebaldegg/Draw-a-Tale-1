import requests
import sys
import uuid
from datetime import datetime

class DrawATaleAPITester:
    def __init__(self, base_url="https://a63ccf0d-f31c-4ac2-91ca-11887ddf1804.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_data = None

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

    def test_register(self):
        """Test user registration"""
        # Generate unique username and email
        unique_id = uuid.uuid4().hex[:8]
        username = f"test_user_{unique_id}"
        email = f"test_{unique_id}@example.com"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": email,
                "username": username,
                "password": "Test123!",
                "user_type": "child",
                "age": 8
            }
        )
        
        if success:
            self.user_data = response
            print(f"Created test user: {username} with email: {email}")
        
        return success, response

    def test_login(self):
        """Test user login"""
        if not self.user_data:
            print("❌ Cannot test login without registered user")
            return False, {}
            
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.user_data["email"],
                "password": "Test123!"
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

def main():
    # Setup
    tester = DrawATaleAPITester()
    
    # Run tests
    health_success, _ = tester.test_health_check()
    if not health_success:
        print("❌ API health check failed, stopping tests")
        return 1
        
    register_success, _ = tester.test_register()
    if not register_success:
        print("❌ Registration failed, stopping tests")
        return 1
        
    login_success, _ = tester.test_login()
    if not login_success:
        print("❌ Login failed, stopping tests")
        return 1
        
    user_success, _ = tester.test_get_current_user()
    if not user_success:
        print("❌ Getting user info failed")
        
    quests_success, _ = tester.test_get_quests()
    if not quests_success:
        print("❌ Getting quests failed")

    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())