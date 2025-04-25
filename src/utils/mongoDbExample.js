/**
 * File ví dụ sử dụng kết nối MongoDB
 * Minh họa cách thực hiện các thao tác CRUD cơ bản
 */

import { connectToDatabase, getCollection, closeConnection } from './database.js';

/**
 * Ví dụ thêm dữ liệu vào collection
 * @param {string} collectionName - Tên collection
 * @param {object} data - Dữ liệu cần thêm
 * @returns {Promise<object>} - Kết quả thêm dữ liệu
 */
export async function insertDocument(collectionName, data) {
  try {
    const collection = await getCollection(collectionName);
    const result = await collection.insertOne(data);
    console.log(`Đã thêm document thành công với ID: ${result.insertedId}`);
    return result;
  } catch (error) {
    console.error('Lỗi khi thêm document:', error);
    throw error;
  }
}

/**
 * Ví dụ lấy dữ liệu từ collection
 * @param {string} collectionName - Tên collection
 * @param {object} query - Truy vấn tìm kiếm
 * @returns {Promise<Array>} - Mảng các document tìm thấy
 */
export async function findDocuments(collectionName, query = {}) {
  try {
    const collection = await getCollection(collectionName);
    const documents = await collection.find(query).toArray();
    console.log(`Tìm thấy ${documents.length} document`);
    return documents;
  } catch (error) {
    console.error('Lỗi khi tìm documents:', error);
    throw error;
  }
}

/**
 * Ví dụ cập nhật dữ liệu trong collection
 * @param {string} collectionName - Tên collection
 * @param {object} query - Truy vấn tìm kiếm
 * @param {object} update - Dữ liệu cập nhật
 * @returns {Promise<object>} - Kết quả cập nhật
 */
export async function updateDocument(collectionName, query, update) {
  try {
    const collection = await getCollection(collectionName);
    const result = await collection.updateOne(query, { $set: update });
    console.log(`Đã cập nhật ${result.modifiedCount} document`);
    return result;
  } catch (error) {
    console.error('Lỗi khi cập nhật document:', error);
    throw error;
  }
}

/**
 * Ví dụ xóa dữ liệu khỏi collection
 * @param {string} collectionName - Tên collection
 * @param {object} query - Truy vấn tìm kiếm
 * @returns {Promise<object>} - Kết quả xóa
 */
export async function deleteDocument(collectionName, query) {
  try {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteOne(query);
    console.log(`Đã xóa ${result.deletedCount} document`);
    return result;
  } catch (error) {
    console.error('Lỗi khi xóa document:', error);
    throw error;
  }
}

/**
 * Ví dụ sử dụng các hàm CRUD
 */
export async function runExample() {
  try {
    // Kết nối đến MongoDB
    await connectToDatabase();
    
    const collectionName = 'users';
    
    // Thêm một document
    const newUser = {
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      age: 30,
      createdAt: new Date()
    };
    
    await insertDocument(collectionName, newUser);
    
    // Tìm tất cả documents
    const allUsers = await findDocuments(collectionName);
    console.log('Tất cả người dùng:', allUsers);
    
    // Tìm user có email cụ thể
    const userByEmail = await findDocuments(collectionName, { email: 'nguyenvana@example.com' });
    console.log('Người dùng tìm theo email:', userByEmail);
    
    // Cập nhật user
    await updateDocument(
      collectionName, 
      { email: 'nguyenvana@example.com' }, 
      { age: 31, updatedAt: new Date() }
    );
    
    // Xem user sau khi cập nhật
    const updatedUser = await findDocuments(collectionName, { email: 'nguyenvana@example.com' });
    console.log('Người dùng sau khi cập nhật:', updatedUser);
    
    // Xóa user
    await deleteDocument(collectionName, { email: 'nguyenvana@example.com' });
    
    // Đóng kết nối
    await closeConnection();
    
    console.log('Đã hoàn thành ví dụ MongoDB');
  } catch (error) {
    console.error('Lỗi trong ví dụ MongoDB:', error);
  }
}

// Chạy ví dụ nếu file được chạy trực tiếp
if (require.main === module) {
  runExample()
    .then(() => console.log('Đã chạy ví dụ xong'))
    .catch(err => console.error('Lỗi khi chạy ví dụ:', err));
}

export default {
  insertDocument,
  findDocuments,
  updateDocument,
  deleteDocument,
  runExample
}; 