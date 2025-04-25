/**
 * File kết nối với MongoDB
 * Sử dụng để thiết lập và quản lý kết nối đến cơ sở dữ liệu MongoDB Atlas
 */

import { MongoClient } from 'mongodb';

// Chuỗi kết nối đến MongoDB Atlas
const uri = "mongodb+srv://hihuythanh:Thanh%401984@cluster0.tp90k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Tạo một instance của MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Biến để lưu trữ kết nối
let dbConnection = null;

/**
 * Kết nối đến MongoDB và trả về kết nối
 * @returns {Promise<object>} - Kết nối đến database
 */
export async function connectToDatabase() {
  try {
    // Nếu kết nối đã được thiết lập, trả về kết nối hiện tại
    if (dbConnection) {
      return { client, db: dbConnection };
    }

    // Thiết lập kết nối mới
    await client.connect();
    console.log('Đã kết nối thành công đến MongoDB Atlas');
    
    // Lấy kết nối đến database mặc định
    dbConnection = client.db();
    
    return { client, db: dbConnection };
  } catch (error) {
    console.error('Lỗi kết nối đến MongoDB:', error);
    throw error;
  }
}

/**
 * Đóng kết nối đến MongoDB
 */
export async function closeConnection() {
  try {
    if (client) {
      await client.close();
      console.log('Đã đóng kết nối MongoDB');
      dbConnection = null;
    }
  } catch (error) {
    console.error('Lỗi khi đóng kết nối MongoDB:', error);
    throw error;
  }
}

/**
 * Lấy collection từ database
 * @param {string} collectionName - Tên collection cần lấy
 * @returns {Promise<Collection>} - MongoDB Collection
 */
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

// Export các hàm và đối tượng cần thiết
export default {
  connectToDatabase,
  closeConnection,
  getCollection,
  client
}; 