"""
Module kết nối với MongoDB Atlas
Sử dụng để thiết lập và quản lý kết nối đến cơ sở dữ liệu MongoDB
"""

import logging
from pymongo import MongoClient
from typing import Optional, Dict, Any, Tuple

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Chuỗi kết nối đến MongoDB Atlas
MONGO_URI = "mongodb+srv://hihuythanh:Thanh%401984@cluster0.tp90k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Tên database mặc định
DEFAULT_DB_NAME = "phongthuyso"

# Biến toàn cục để lưu trữ kết nối
_mongo_client: Optional[MongoClient] = None
_db = None

def get_mongo_client() -> MongoClient:
    """
    Lấy MongoDB client hiện tại hoặc tạo mới nếu chưa tồn tại
    
    Returns:
        MongoClient: MongoDB client đã được kết nối
    """
    global _mongo_client
    
    if _mongo_client is None:
        logger.info("Khởi tạo kết nối MongoDB mới")
        _mongo_client = MongoClient(MONGO_URI)
        
        # Kiểm tra kết nối
        try:
            # Ping database để xác nhận kết nối thành công
            _mongo_client.admin.command('ping')
            logger.info("Đã kết nối thành công đến MongoDB Atlas")
        except Exception as e:
            logger.error(f"Không thể kết nối đến MongoDB: {e}")
            raise
            
    return _mongo_client

def get_database(db_name: str = DEFAULT_DB_NAME):
    """
    Lấy kết nối đến database
    
    Args:
        db_name (str, optional): Tên database. Mặc định là "phongthuyso".
        
    Returns:
        Database: Kết nối đến database MongoDB
    """
    global _db
    
    if _db is None or _db.name != db_name:
        client = get_mongo_client()
        _db = client[db_name]
        logger.info(f"Đã kết nối đến database: {db_name}")
        
    return _db

def get_collection(collection_name: str, db_name: str = DEFAULT_DB_NAME):
    """
    Lấy một collection từ database
    
    Args:
        collection_name (str): Tên collection
        db_name (str, optional): Tên database. Mặc định là "phongthuyso".
        
    Returns:
        Collection: MongoDB collection
    """
    db = get_database(db_name)
    return db[collection_name]

def close_connections():
    """Đóng kết nối đến MongoDB"""
    global _mongo_client, _db
    
    if _mongo_client is not None:
        _mongo_client.close()
        _mongo_client = None
        _db = None
        logger.info("Đã đóng kết nối đến MongoDB")

def insert_document(collection_name: str, document: Dict[str, Any], db_name: str = DEFAULT_DB_NAME) -> str:
    """
    Thêm một document vào collection
    
    Args:
        collection_name (str): Tên collection
        document (Dict[str, Any]): Document cần thêm
        db_name (str, optional): Tên database. Mặc định là "phongthuyso".
        
    Returns:
        str: ID của document đã thêm
    """
    collection = get_collection(collection_name, db_name)
    result = collection.insert_one(document)
    logger.info(f"Đã thêm document vào {collection_name} với ID: {result.inserted_id}")
    return str(result.inserted_id)

def find_documents(collection_name: str, query: Dict[str, Any] = None, 
                  projection: Dict[str, Any] = None, db_name: str = DEFAULT_DB_NAME):
    """
    Tìm documents từ collection
    
    Args:
        collection_name (str): Tên collection
        query (Dict[str, Any], optional): Điều kiện tìm kiếm. Mặc định là None.
        projection (Dict[str, Any], optional): Các trường cần lấy. Mặc định là None.
        db_name (str, optional): Tên database. Mặc định là "phongthuyso".
        
    Returns:
        list: Danh sách các documents
    """
    collection = get_collection(collection_name, db_name)
    if query is None:
        query = {}
    cursor = collection.find(query, projection)
    return list(cursor)

def update_document(collection_name: str, query: Dict[str, Any], 
                   update_data: Dict[str, Any], db_name: str = DEFAULT_DB_NAME) -> int:
    """
    Cập nhật document trong collection
    
    Args:
        collection_name (str): Tên collection
        query (Dict[str, Any]): Điều kiện tìm kiếm
        update_data (Dict[str, Any]): Dữ liệu cần cập nhật
        db_name (str, optional): Tên database. Mặc định là "phongthuyso".
        
    Returns:
        int: Số lượng documents đã cập nhật
    """
    collection = get_collection(collection_name, db_name)
    result = collection.update_one(query, {"$set": update_data})
    logger.info(f"Đã cập nhật {result.modified_count} document trong {collection_name}")
    return result.modified_count

def delete_document(collection_name: str, query: Dict[str, Any], 
                   db_name: str = DEFAULT_DB_NAME) -> int:
    """
    Xóa document từ collection
    
    Args:
        collection_name (str): Tên collection
        query (Dict[str, Any]): Điều kiện tìm kiếm
        db_name (str, optional): Tên database. Mặc định là "phongthuyso".
        
    Returns:
        int: Số lượng documents đã xóa
    """
    collection = get_collection(collection_name, db_name)
    result = collection.delete_one(query)
    logger.info(f"Đã xóa {result.deleted_count} document từ {collection_name}")
    return result.deleted_count 