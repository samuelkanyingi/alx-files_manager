const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
// const mime = require('mime-types');
// const { ObjectID } = require('mongodb');
// const Bull = require('bull');
// const imageThumbnail = require('image-thumbnail');

// const fileQueue = new Bull('fileQueue');
// const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redisClient'); // Note: Adjust if the filename or path is different
// const redisClient = require('../utils/redis');

class FilesController {
  // static async someMethod(req, res) {
  //     const file = {
  //         userId: ObjectID(userId),
  //         name,
  //         type,
  //         isPublic: isPublic || false,
  //         parentId: parentId || 0,
  //         localPath
  //     };

  // try {
  //     const result = await dbClient.db.collection('files').insertOne(file);
  //     const fileId = result.insertedId.toString();

  //     if (type === 'image') {
  //         fileQueue.add({ userId, fileId });
  //     }

  //     res.status(201).json({
  //         id: fileId,
  //         userId,
  //         name,
  //         type,
  //         isPublic: file.isPublic,
  //         parentId: file.parentId
  //     });
  // } catch (error) {
  //     console.error('Error processing file:', error);
  //     res.status(500).json({ error: 'An error occurred while processing the file' });
  // }
  // }
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: new dbClient.ObjectID(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileDocument = {
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId !== 0 ? new dbClient.ObjectID(parentId) : 0,
      localPath: null,
    };

    if (type === 'folder') {
      const result = await dbClient.db.collection('files').insertOne(fileDocument);
      fileDocument._id = result.insertedId;
      return res.status(201).json(fileDocument);
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const fileId = uuidv4();
    const filePath = path.join(folderPath, fileId);
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

    fileDocument.localPath = filePath;
    const result = await dbClient.db.collection('files').insertOne(fileDocument);
    fileDocument._id = result.insertedId;

    return res.status(201).json(fileDocument);
    //   } catch(err, res) {
    //     console.error('Error uploading file:', err);
    //     res.status(500).json({ error: 'Internal Server Error' });
    //   }
  }

  //    static async getShow(req, res) {
  //         const token = req.headers['x-token'];
  //         if (!token) {
  //             return res.status(401).json({ error: 'Unauthorized' });
  //         }

  //         const key = `auth_${token}`;
  //         const userId = await redisClient.get(key);

  //         if (!userId) {
  //             return res.status(401).json({ error: 'Unauthorized' });
  //         }

  //         const fileId = req.params.id;
  //         const file = await dbClient.db.collection('files').findOne(
  //          { _id: new dbClient.ObjectID(fileId), userId: new dbClient.ObjectID(userId) });

  //         if (!file) {
  //             return res.status(404).json({ error: 'Not found' });
  //         }

  //         return res.status(200).json(file);
  //     }

  //     static async getIndex(req, res) {
  //         const token = req.headers['x-token'];
  //         if (!token) {
  //             return res.status(401).json({ error: 'Unauthorized' });
  //         }

  //         const key = `auth_${token}`;
  //         const userId = await redisClient.get(key);

  //         if (!userId) {
  //             return res.status(401).json({ error: 'Unauthorized' });
  //         }

  //         const parentId = req.query.parentId || 0;
  //         const page = parseInt(req.query.page) || 0;

  //         const files = await dbClient.db.collection
  //          ('files').aggregate([
  //             { $match: { parentId: parentId == 0 ? 0 :
  //              new dbClient.ObjectID(parentId), userId: new dbClient.ObjectID(userId) } },
  //             { $skip: page * 20 },
  //             { $limit: 20 }
  //         ]).toArray();

  //         return res.status(200).json(files);
  //     }
  //     static async putPublish(req, res) {
  //         const token = req.headers['x-token'];
  //         if (!token) {
  //             return res.status(401).json({ error: 'Unauthorized' });
  //         }

  //         const key = `auth_${token}`;
  //         const userId = await redisClient.get(key);

  //         if (!userId) {
  //             return res.status(401).json({ error: 'Unauthorized' });
  //         }

  //         const fileId = req.params.id;
  //         const file = await dbClient.db.collection('files').findOneAndUpdate(
  //             { _id: new ObjectID(fileId), userId: new ObjectID(userId) },
  //             { $set: { isPublic: true } },
  //             { returnOriginal: false }
  //         );

  //         if (!file.value) {
  //             return res.status(404).json({ error: 'Not found' });
  //         }

  //         return res.status(200).json(file.value);
  //     }

  //     static async putUnpublish(req, res) {
  //         const token = req.headers['x-token'];
  //         if (!token) {
  //             return res.status(401).json({ error: 'Unauthorized' });
  //         }

  //         const key = `auth_${token}`;
  //         const userId = await redisClient.get(key);

  //         if (!userId) {
  //             return res.status(401).json({ error: 'Unauthorized' });
  //         }

  //         const fileId = req.params.id;
  //         const file = await dbClient.db.collection('files').findOneAndUpdate(
  //             { _id: new ObjectID(fileId), userId: new ObjectID(userId) },
  //             { $set: { isPublic: false } },
  //             { returnOriginal: false }
  //         );

  //         if (!file.value) {
  //             return res.status(404).json({ error: 'Not found' });
  //         }

  //         return res.status(200).json(file.value);
  //     }
  //     static async getFile(req, res) {
  //         const fileId = req.params.id;
  //         const file = await dbClient.db.collection('files').findOne(
  //          { _id: new ObjectID(fileId) });

  //         if (!file) {
  //             return res.status(404).json({ error: 'Not found' });
  //         }

  //         const token = req.headers['x-token'];
  //         if (!file.isPublic) {
  //             if (!token) {
  //                 return res.status(404).json({ error: 'Not found' });
  //             }

  //             const key = `auth_${token}`;
  //             const userId = await redisClient.get(key);

  //             if (!userId || userId !== file.userId.toString()) {
  //                 return res.status(404).json({ error: 'Not found' });
  //             }
  //         }

  //         if (file.type === 'folder') {
  //             return res.status(400).json({ error: "A folder doesn't have content" });
  //         }

  //         const filePath = file.localPath;
  //         if (!fs.existsSync(filePath)) {
  //             return res.status(404).json({ error: 'Not found' });
  //         }

  //         const mimeType = mime.lookup(file.name);
  //         res.setHeader('Content-Type', mimeType);

//         const fileContent = fs.readFileSync(filePath, 'utf8');
//         return res.status(200).send(fileContent);
//     }
}
module.exports = FilesController;
