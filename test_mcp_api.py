"""
Test API - Phong Thuy So với mô hình MCP

File này chứa các test case để kiểm tra API của hệ thống Phong Thuy So
đã được cải tiến sử dụng mô hình MCP (Multi-Component Paradigm).
"""

import json
import unittest
import os
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from main import app

class TestPhongThuyMCPAPI(unittest.TestCase):
    """Test cases cho các endpoint của API Phong Thuy So với cấu trúc MCP."""

    def setUp(self):
        """Thiết lập môi trường test."""
        self.client = TestClient(app)
        self.test_user = {
            "email": "test@example.com",
            "fullname": "Test User",
            "password": "password123"
        }
        self.test_api_key = {
            "name": "Test API Key"
        }
        self.test_payment = {
            "plan_id": "basic",
            "payment_method": "credit_card",
            "amount": 99000,
            "currency": "VND"
        }
        # Đăng ký user mới cho mỗi test
        self.register_test_user()

    def register_test_user(self):
        """Đăng ký user test."""
        try:
            self.client.post("/api/user/register", json=self.test_user)
        except Exception:
            pass  # Có thể user đã tồn tại

    def get_access_token(self):
        """Lấy access token."""
        response = self.client.post(
            "/api/user/token",
            data={
                "username": self.test_user["email"],
                "password": self.test_user["password"]
            }
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        return None

    def get_headers(self):
        """Tạo headers có token xác thực."""
        token = self.get_access_token()
        return {"Authorization": f"Bearer {token}"}

    # TEST ROOT AGENT
    @patch('agent.root_agent.handle_request')
    def test_chat_endpoint(self, mock_handle_request):
        """Test endpoint chat sử dụng root_agent."""
        # Setup mock
        mock_handle_request.return_value = {"content": "Xin chào, tôi là Phong Thủy Bot", "agent": "root_agent"}
        
        # Thực hiện request
        response = self.client.post(
            "/api/chat",
            json={"message": "Xin chào", "context": {}}
        )
        
        # Kiểm tra kết quả
        self.assertEqual(response.status_code, 200)
        self.assertIn("content", response.json())
        self.assertEqual(response.json()["agent"], "root_agent")
        
        # Xác minh mock được gọi
        mock_handle_request.assert_called_once()

    # TEST BATCUCLINH_SO AGENT
    @patch('sub_agents.batcuclinh_so.agent.batcuclinh_so_agent.handle_request')
    def test_analyze_phone_number(self, mock_handle_request):
        """Test endpoint phân tích số điện thoại với batcuclinh_so_agent."""
        # Setup mock
        mock_response = {
            "phone_number": "0912345678",
            "score": 85,
            "element": "Kim",
            "compatible_elements": ["Thổ"],
            "incompatible_elements": ["Hỏa"],
            "analysis": "Số điện thoại này có năng lượng tốt",
            "recommendations": "Số điện thoại này phù hợp với người mệnh Kim, Thổ"
        }
        mock_handle_request.return_value = {
            "content": mock_response,
            "agent": "batcuclinh_so_agent"
        }
        
        # Thực hiện request
        response = self.client.post(
            "/api/analyze/phone",
            json={"phone_number": "0912345678"},
            headers=self.get_headers()
        )
        
        # Kiểm tra kết quả
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["agent"], "batcuclinh_so_agent")
        self.assertIn("content", response.json())
        
        # Xác minh mock được gọi
        mock_handle_request.assert_called_once()

    @patch('sub_agents.batcuclinh_so.agent.batcuclinh_so_agent.handle_request')
    def test_analyze_bank_account(self, mock_handle_request):
        """Test endpoint phân tích số tài khoản với batcuclinh_so_agent."""
        # Setup mock
        mock_response = {
            "account_number": "1234567890",
            "score": 80,
            "element": "Thủy",
            "prosperity_level": "Cao",
            "recommendations": "Số tài khoản này mang lại tài lộc"
        }
        mock_handle_request.return_value = {
            "content": mock_response,
            "agent": "batcuclinh_so_agent"
        }
        
        # Thực hiện request
        response = self.client.post(
            "/api/analyze/bank-account",
            json={"account_number": "1234567890"},
            headers=self.get_headers()
        )
        
        # Kiểm tra kết quả
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["agent"], "batcuclinh_so_agent")
        self.assertIn("content", response.json())
        
        # Xác minh mock được gọi
        mock_handle_request.assert_called_once()

    # TEST PAYMENT AGENT
    @patch('sub_agents.payment.agent.payment_agent.handle_request')
    def test_process_payment(self, mock_handle_request):
        """Test endpoint xử lý thanh toán với payment_agent."""
        # Setup mock
        mock_response = {
            "transaction_id": "tx_123456789",
            "status": "completed",
            "amount": 99000,
            "timestamp": "2025-04-24T10:00:00"
        }
        mock_handle_request.return_value = {
            "content": mock_response,
            "agent": "payment_agent"
        }
        
        # Thực hiện request
        response = self.client.post(
            "/api/payment/process",
            json=self.test_payment,
            headers=self.get_headers()
        )
        
        # Kiểm tra kết quả
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["agent"], "payment_agent")
        self.assertIn("content", response.json())
        self.assertIn("transaction_id", response.json()["content"])
        
        # Xác minh mock được gọi
        mock_handle_request.assert_called_once()

    # TEST USER AGENT
    @patch('sub_agents.user.agent.user_agent.handle_request')
    def test_get_user_profile(self, mock_handle_request):
        """Test endpoint lấy thông tin người dùng với user_agent."""
        # Setup mock
        mock_response = {
            "user_id": "123",
            "email": "test@example.com",
            "fullname": "Test User",
            "element": "Kim",
            "lucky_numbers": [1, 3, 7]
        }
        mock_handle_request.return_value = {
            "content": mock_response,
            "agent": "user_agent"
        }
        
        # Thực hiện request
        response = self.client.get(
            "/api/user/profile",
            headers=self.get_headers()
        )
        
        # Kiểm tra kết quả
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["agent"], "user_agent")
        self.assertIn("content", response.json())
        self.assertEqual(response.json()["content"]["email"], "test@example.com")
        
        # Xác minh mock được gọi
        mock_handle_request.assert_called_once()

    @patch('sub_agents.user.agent.user_agent.handle_request')
    def test_update_user_profile(self, mock_handle_request):
        """Test endpoint cập nhật thông tin người dùng với user_agent."""
        # Setup mock
        mock_response = {
            "user_id": "123",
            "email": "test@example.com",
            "fullname": "Updated User",
            "element": "Kim",
            "lucky_numbers": [1, 3, 7]
        }
        mock_handle_request.return_value = {
            "content": mock_response,
            "agent": "user_agent"
        }
        
        # Thực hiện request
        response = self.client.put(
            "/api/user/profile",
            json={"fullname": "Updated User"},
            headers=self.get_headers()
        )
        
        # Kiểm tra kết quả
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["agent"], "user_agent")
        self.assertIn("content", response.json())
        self.assertEqual(response.json()["content"]["fullname"], "Updated User")
        
        # Xác minh mock được gọi
        mock_handle_request.assert_called_once()


if __name__ == '__main__':
    unittest.main() 