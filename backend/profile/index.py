import json
import os
import base64
import uuid
from typing import Optional
import psycopg2
import boto3
from pydantic import BaseModel, EmailStr, Field

class UserProfile(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    age: Optional[int] = Field(None, ge=16, le=100)
    city: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    about_me: Optional[str] = None
    skills: Optional[list[str]] = []
    experience: Optional[str] = None
    education: Optional[str] = None

class PhotoUpload(BaseModel):
    photo_base64: str
    user_id: int

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def upload_photo_to_s3(photo_base64: str, user_id: int) -> str:
    s3 = boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    
    photo_data = base64.b64decode(photo_base64)
    file_extension = 'jpg'
    file_key = f'avatars/{user_id}_{uuid.uuid4()}.{file_extension}'
    
    s3.put_object(
        Bucket='files',
        Key=file_key,
        Body=photo_data,
        ContentType='image/jpeg'
    )
    
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
    return cdn_url

def handler(event: dict, context) -> dict:
    """API для управления профилями пользователей и загрузки фото"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if method == 'GET':
            user_id = event.get('queryStringParameters', {}).get('user_id')
            
            if user_id:
                cursor.execute('''
                    SELECT id, email, full_name, age, city, phone, about_me, 
                           avatar_url, skills, experience, education, created_at, updated_at
                    FROM users WHERE id = %s
                ''', (user_id,))
                row = cursor.fetchone()
                
                if row:
                    user = {
                        'id': row[0], 'email': row[1], 'full_name': row[2],
                        'age': row[3], 'city': row[4], 'phone': row[5],
                        'about_me': row[6], 'avatar_url': row[7], 'skills': row[8] or [],
                        'experience': row[9], 'education': row[10],
                        'created_at': str(row[11]), 'updated_at': str(row[12])
                    }
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(user, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
            else:
                cursor.execute('''
                    SELECT id, email, full_name, age, city, phone, about_me, 
                           avatar_url, skills, experience, education
                    FROM users ORDER BY created_at DESC LIMIT 100
                ''')
                rows = cursor.fetchall()
                users = [{
                    'id': r[0], 'email': r[1], 'full_name': r[2], 'age': r[3],
                    'city': r[4], 'phone': r[5], 'about_me': r[6],
                    'avatar_url': r[7], 'skills': r[8] or [], 'experience': r[9], 'education': r[10]
                } for r in rows]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'users': users}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            if event.get('body'):
                data = json.loads(event['body'])
                
                if 'photo_base64' in data and 'user_id' in data:
                    photo_upload = PhotoUpload(**data)
                    avatar_url = upload_photo_to_s3(photo_upload.photo_base64, photo_upload.user_id)
                    
                    cursor.execute('''
                        UPDATE users SET avatar_url = %s, updated_at = CURRENT_TIMESTAMP
                        WHERE id = %s
                    ''', (avatar_url, photo_upload.user_id))
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'avatar_url': avatar_url}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                else:
                    profile = UserProfile(**data)
                    cursor.execute('''
                        INSERT INTO users (email, full_name, age, city, phone, about_me, skills, experience, education)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    ''', (profile.email, profile.full_name, profile.age, profile.city, profile.phone,
                          profile.about_me, profile.skills, profile.experience, profile.education))
                    user_id = cursor.fetchone()[0]
                    conn.commit()
                    
                    return {
                        'statusCode': 201,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'id': user_id, 'message': 'User created'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
        
        elif method == 'PUT':
            if event.get('body'):
                data = json.loads(event['body'])
                user_id = data.get('id')
                
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User ID required'}),
                        'isBase64Encoded': False
                    }
                
                update_fields = []
                params = []
                
                for field in ['full_name', 'age', 'city', 'phone', 'about_me', 'skills', 'experience', 'education']:
                    if field in data:
                        update_fields.append(f"{field} = %s")
                        params.append(data[field])
                
                if update_fields:
                    params.append(user_id)
                    query = f"UPDATE users SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
                    cursor.execute(query, params)
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'User updated'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
