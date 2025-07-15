# Encrypted Database Backup System

## 📋 Overview

This system automatically creates encrypted backups of the MongoDB database every time the server starts. Backups are stored as encrypted JSON files using **AES-256-CBC**, ensuring the security of sensitive data.

## 🔐 Security and Encryption

### Encryption Algorithm

- **Algorithm**: AES-256-CBC (Advanced Encryption Standard)
- **Key Size**: 256 bits
- **Mode**: Cipher Block Chaining (CBC)
- **Initialization Vector (IV)**: Randomly generated for each backup

### Data Protection

- ✅ **Encryption at rest**: All backups are stored encrypted
- ✅ **Unique IV**: Each backup has its own initialization vector
- ✅ **Secure password**: Uses environment variable (not hardcoded)
- ✅ **Key derivation**: Uses scrypt to derive the encryption key

## 📁 File Structure

```
server/
├── backups/
│   ├── BACKUP.md (this file)
│   ├── backup_1704672000000.json
│   ├── backup_1704672100000.json
│   └── ...
└── src/
  └── backupDB.ts
```

### File Naming

- **Format**: `backup_[timestamp].json`
- **Timestamp**: Milliseconds since epoch (Unix timestamp)
- **Example**: `backup_1704672000000.json` = January 7, 2024, 20:00:00 UTC

## 🗃️ Backed Up Collections

The system automatically backs up the following MongoDB collections:

| Collection        | Description                 |
| ----------------- | --------------------------- |
| `logs`            | System activity logs        |
| `users`           | User information            |
| `userConfig`      | User configurations         |
| `imagePaths`      | Stored image paths          |
| `medicationsUser` | User-customized medications |

## ⚙️ Configuration

### Required Environment Variable

```bash
DATABASE_BACKUP_PASSWORD="your-super-secure-password-here"
```

### Password Requirements

- **Minimum**: 16 characters
- **Recommended**: 32+ characters
- **Include**: Upper/lowercase letters, numbers, symbols
- **Example**: `MyS3cur3DB-B4ckup!P@ssw0rd#2024`

### System Setup

**Windows (PowerShell):**

```powershell
$env:DATABASE_BACKUP_PASSWORD="your-super-secure-password"
npm run start
```

**Linux/macOS:**

```bash
export DATABASE_BACKUP_PASSWORD="your-super-secure-password"
npm run start
```

## 🔄 Backup Process

### Automatic Execution

1. **Server start**: Backup runs automatically
2. **Verification**: Checks if `DATABASE_BACKUP_PASSWORD` is set
3. **Connection**: Connects to MongoDB
4. **Extraction**: Retrieves all documents from defined collections
5. **Structuring**: Organizes data in JSON format
6. **Encryption**: Encrypts data using AES-256-CBC
7. **Storage**: Saves file in `/backups/`

### If Password Not Set

If `DATABASE_BACKUP_PASSWORD` is not defined, the system:

- ⚠️ Skips the backup process
- 📝 Logs: "Database backup password is not set. Skipping backup."
- ✅ Continues normal server execution

## 📄 Backup File Format

### Encrypted Structure

```json
{
  "iv": "a1b2c3d4e5f6...",
  "data": "encrypted_data_here..."
}
```

### Decrypted Structure (after decrypt)

```json
{
  "logs": [...],
  "users": [...],
  "userConfig": [...],
  "imagePaths": [...],
  "medicationsUser": [...]
}
```

## 🔓 Backup Restoration

### Available Decryption Function

```typescript
import { decryptDatabase } from "./src/backupDB.js";

// Read backup file
const encryptedData = fs.readFileSync("backup_1704672000000.json", "utf8");
const parsedData = JSON.parse(encryptedData);

// Decrypt data
const decryptedData = decryptDatabase(JSON.stringify(parsedData));
const backupContent = JSON.parse(decryptedData);
```

### Manual Restoration Process

1. **Set environment variable** with the same password used for backup creation
2. **Use the `decryptDatabase()` function** to decrypt the file
3. **Process the data** collection by collection
4. **Insert into MongoDB** using appropriate tools

## 🚨 Security Considerations

### ⚠️ Important

- **DO NOT commit passwords** to the code repository
- **Rotate passwords regularly** in production environments
- **Use secret managers** in production (AWS Secrets Manager, Azure Key Vault)
- **Limit access** to backup files
- **Backup the password** in a separate secure location

### 🔐 Best Practices

- Store backups in multiple locations
- Test restoration periodically
- Monitor storage space
- Implement automatic rotation of old backups
- Use multi-factor authentication for backup access

## 📊 Monitoring and Logs

### Success Messages

```
Database backup completed successfully.
```

### Error Messages

```
Error during database backup: [error description]
DATABASE_BACKUP_PASSWORD environment variable is required for database encryption
Failed to decrypt database backup: [error description]
```

## 🔧 Troubleshooting

### Error: "Database backup password is not set"

**Cause**: The `DATABASE_BACKUP_PASSWORD` variable is not defined  
**Solution**: Set the environment variable before starting the server

### Error: "Failed to decrypt database backup"

**Cause**: Incorrect password or corrupted file  
**Solution**: Ensure you use the same password and the file is not damaged

### Backup not generated

**Cause**: MongoDB connection issues or write permissions  
**Solution**: Check DB connection and `/backups/` directory permissions

## 📈 System Statistics

- **Frequency**: Once per server start
- **Location**: `./backups/`
- **Format**: Encrypted JSON
- **Compression**: None (gzip can be added)
- **Retention**: Manual (implement cleanup policy if needed)

---

_Last updated: July 11, 2025_  
_Backup system implemented in: `src/backupDB.ts`_
