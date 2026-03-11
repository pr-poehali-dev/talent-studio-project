"""
Backend функция для работы с анкетами пользователей.
Поддерживает регистрацию пользователей, сохранение ответов и управление вопросами.
"""

import json
import os
import psycopg2
from typing import Dict, Any, List, Optional
from datetime import datetime

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        if action == 'questions':
            if method == 'GET':
                return get_questions(event, headers)
            elif method == 'POST':
                return create_question(event, headers)
            elif method == 'PUT':
                return update_question(event, headers)
            elif method == 'DELETE':
                return delete_question(event, headers)
        
        elif action == 'register' and method == 'POST':
            return register_user(event, headers)
        
        elif action == 'submit' and method == 'POST':
            return submit_survey(event, headers)
        
        elif action == 'submit-stage' and method == 'POST':
            return submit_survey_stage(event, headers)
        
        elif action == 'user' and method == 'GET':
            return get_user_survey(event, headers)
        
        elif action == 'status' and method == 'GET':
            return get_survey_status(event, headers)
        
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Not found. Use ?action=questions|register|submit|submit-stage|user|status'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def get_questions(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    include_inactive = params.get('includeInactive') == 'true'
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    if include_inactive:
        cur.execute("""
            SELECT id, category, question_text, question_type, options, 
                   placeholder, required, order_index, active
            FROM survey_questions_v2
            ORDER BY category, order_index
        """)
    else:
        cur.execute("""
            SELECT id, category, question_text, question_type, options, 
                   placeholder, required, order_index, active
            FROM survey_questions_v2
            WHERE active = TRUE
            ORDER BY category, order_index
        """)
    
    questions = []
    for row in cur.fetchall():
        questions.append({
            'id': row[0],
            'category': row[1],
            'question_text': row[2],
            'question_type': row[3],
            'options': row[4],
            'placeholder': row[5],
            'required': row[6],
            'order_index': row[7],
            'active': row[8]
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'questions': questions}),
        'isBase64Encoded': False
    }

def create_question(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    body = json.loads(event.get('body', '{}'))
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        INSERT INTO survey_questions_v2 
        (category, question_text, question_type, options, placeholder, required, order_index, active)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        body.get('category'),
        body.get('question_text'),
        body.get('question_type'),
        json.dumps(body.get('options', {})),
        body.get('placeholder'),
        body.get('required', True),
        body.get('order_index', 999),
        body.get('active', True)
    ))
    
    question_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': headers,
        'body': json.dumps({'id': question_id, 'message': 'Question created'}),
        'isBase64Encoded': False
    }

def update_question(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    body = json.loads(event.get('body', '{}'))
    question_id = body.get('id')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        UPDATE survey_questions_v2
        SET category = %s, question_text = %s, question_type = %s,
            options = %s, placeholder = %s, required = %s, 
            order_index = %s, active = %s
        WHERE id = %s
    """, (
        body.get('category'),
        body.get('question_text'),
        body.get('question_type'),
        json.dumps(body.get('options', {})),
        body.get('placeholder'),
        body.get('required'),
        body.get('order_index'),
        body.get('active'),
        question_id
    ))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'message': 'Question updated'}),
        'isBase64Encoded': False
    }

def delete_question(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    question_id = params.get('id')
    
    if not question_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Missing question id'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("UPDATE survey_questions_v2 SET active = FALSE WHERE id = %s", (question_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'message': 'Question deactivated'}),
        'isBase64Encoded': False
    }

def register_user(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    body = json.loads(event.get('body', '{}'))
    
    name = body.get('name')
    email = body.get('email')
    gender = body.get('gender')
    birth_date = body.get('birthDate')
    goals = body.get('goals', [])
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    existing_user = cur.fetchone()
    
    if existing_user:
        user_id = existing_user[0]
        cur.execute("""
            UPDATE users 
            SET name = %s, gender = %s, birth_date = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (name, gender, birth_date, user_id))
    else:
        cur.execute("""
            INSERT INTO users (name, email, gender, birth_date)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, (name, email, gender, birth_date))
        user_id = cur.fetchone()[0]
    
    cur.execute("""
        INSERT INTO user_surveys (user_id, goals, stage, completed, stage1_completed)
        VALUES (%s, %s, 1, FALSE, TRUE)
        RETURNING id
    """, (user_id, goals))
    
    survey_id = cur.fetchone()[0]
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'user_id': user_id,
            'survey_id': survey_id,
            'message': 'User registered successfully'
        }),
        'isBase64Encoded': False
    }

def submit_survey(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    body = json.loads(event.get('body', '{}'))
    
    survey_id = body.get('survey_id')
    answers = body.get('answers', {})
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    for question_id, answer_value in answers.items():
        if isinstance(answer_value, (list, dict)):
            cur.execute("""
                INSERT INTO survey_answers (survey_id, question_id, answer_json)
                VALUES (%s, %s, %s)
            """, (survey_id, int(question_id), json.dumps(answer_value)))
        else:
            cur.execute("""
                INSERT INTO survey_answers (survey_id, question_id, answer_value)
                VALUES (%s, %s, %s)
            """, (survey_id, int(question_id), str(answer_value)))
    
    cur.execute("""
        UPDATE user_surveys
        SET stage = 2, completed = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    """, (survey_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'message': 'Survey completed successfully'}),
        'isBase64Encoded': False
    }

def get_user_survey(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    email = params.get('email')
    
    if not email:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Email is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT u.id, u.name, u.email, u.gender, u.birth_date,
               s.id, s.goals, s.stage, s.completed
        FROM users u
        LEFT JOIN user_surveys s ON u.id = s.user_id
        WHERE u.email = %s
        ORDER BY s.created_at DESC
        LIMIT 1
    """, (email,))
    
    row = cur.fetchone()
    
    if not row:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'User not found'}),
            'isBase64Encoded': False
        }
    
    result = {
        'user': {
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'gender': row[3],
            'birth_date': str(row[4]) if row[4] else None
        },
        'survey': {
            'id': row[5],
            'goals': row[6],
            'stage': row[7],
            'completed': row[8]
        } if row[5] else None
    }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(result),
        'isBase64Encoded': False
    }

def submit_survey_stage(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Сохранение ответов конкретного этапа анкеты (2 или 3)"""
    body = json.loads(event.get('body', '{}'))
    
    survey_id = body.get('survey_id')
    stage = body.get('stage')
    answers = body.get('answers', {})
    
    if not survey_id or not stage:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'survey_id and stage are required'}),
            'isBase64Encoded': False
        }
    
    if stage not in [2, 3]:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'stage must be 2 or 3'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    for question_id, answer_value in answers.items():
        cur.execute("""
            DELETE FROM survey_answers 
            WHERE survey_id = %s AND question_id = %s
        """, (survey_id, int(question_id)))
        
        if isinstance(answer_value, (list, dict)):
            cur.execute("""
                INSERT INTO survey_answers (survey_id, question_id, answer_json)
                VALUES (%s, %s, %s)
            """, (survey_id, int(question_id), json.dumps(answer_value)))
        else:
            cur.execute("""
                INSERT INTO survey_answers (survey_id, question_id, answer_value)
                VALUES (%s, %s, %s)
            """, (survey_id, int(question_id), str(answer_value)))
    
    if stage == 2:
        cur.execute("""
            UPDATE user_surveys
            SET stage2_completed = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (survey_id,))
    elif stage == 3:
        cur.execute("""
            UPDATE user_surveys
            SET stage3_completed = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (survey_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'message': f'Stage {stage} completed successfully',
            'stage': stage
        }),
        'isBase64Encoded': False
    }

def get_survey_status(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    survey_id = params.get('survey_id')
    
    if not survey_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'survey_id is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            u.id, u.name, u.email,
            s.stage1_completed, s.stage2_completed, s.stage3_completed
        FROM users u
        JOIN user_surveys s ON s.user_id = u.id
        WHERE s.id = %s
    """, (survey_id,))
    
    row = cur.fetchone()
    
    if not row:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Survey not found'}),
            'isBase64Encoded': False
        }
    
    result = {
        'user_id': row[0],
        'user_name': row[1],
        'user_email': row[2],
        'stage1_completed': row[3] or False,
        'stage2_completed': row[4] or False,
        'stage3_completed': row[5] or False
    }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(result),
        'isBase64Encoded': False
    }