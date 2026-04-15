import json
import os
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
}

def handler(event: dict, context) -> dict:
    """API для управления искалками слов олимпиады"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cursor = conn.cursor()

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    try:
        if method == 'GET':
            olympiad_type = params.get('type', 'palette')
            is_admin = params.get('admin') == 'true'
            study_year_param = params.get('study_year')

            if is_admin:
                cursor.execute("""
                    SELECT id, olympiad_type, title, study_years, words, hints, is_active, sort_order, created_at, updated_at
                    FROM word_search_puzzles
                    WHERE olympiad_type = %s
                    ORDER BY sort_order ASC, id ASC
                """, (olympiad_type,))
            else:
                if study_year_param:
                    try:
                        year = int(study_year_param)
                    except ValueError:
                        year = None

                    if year is not None:
                        cursor.execute("""
                            SELECT id, olympiad_type, title, study_years, words, hints, is_active, sort_order, created_at, updated_at
                            FROM word_search_puzzles
                            WHERE olympiad_type = %s AND is_active = TRUE
                              AND (study_years IS NULL OR study_years = '{}' OR %s = ANY(study_years))
                            ORDER BY sort_order ASC, id ASC
                        """, (olympiad_type, study_year_param))
                    else:
                        cursor.execute("""
                            SELECT id, olympiad_type, title, study_years, words, hints, is_active, sort_order, created_at, updated_at
                            FROM word_search_puzzles
                            WHERE olympiad_type = %s AND is_active = TRUE
                            ORDER BY sort_order ASC, id ASC
                        """, (olympiad_type,))
                else:
                    cursor.execute("""
                        SELECT id, olympiad_type, title, study_years, words, hints, is_active, sort_order, created_at, updated_at
                        FROM word_search_puzzles
                        WHERE olympiad_type = %s AND is_active = TRUE
                        ORDER BY sort_order ASC, id ASC
                    """, (olympiad_type,))

            rows = cursor.fetchall()
            result = []
            for row in rows:
                result.append({
                    'id': row[0],
                    'olympiad_type': row[1],
                    'title': row[2],
                    'study_years': list(row[3]) if row[3] else [],
                    'words': row[4] if row[4] else [],
                    'hints': row[5] if row[5] else [],
                    'is_active': row[6],
                    'sort_order': row[7],
                    'created_at': row[8].isoformat() if row[8] else None,
                    'updated_at': row[9].isoformat() if row[9] else None,
                })

            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }

        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            olympiad_type = body.get('olympiad_type', 'palette')
            title = body.get('title', '').strip()
            study_years = body.get('study_years') or []
            words = body.get('words') or []
            hints = body.get('hints') or []
            is_active = body.get('is_active', True)
            sort_order = body.get('sort_order', 0)

            if not title:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'title is required'})
                }

            words_clean = [w.strip().upper() for w in words if w.strip()]
            hints_aligned = hints[:len(words_clean)] + [''] * max(0, len(words_clean) - len(hints))

            cursor.execute("""
                INSERT INTO word_search_puzzles (olympiad_type, title, study_years, words, hints, is_active, sort_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (olympiad_type, title, study_years if study_years else None, json.dumps(words_clean), json.dumps(hints_aligned), is_active, sort_order))

            new_id = cursor.fetchone()[0]
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': new_id})
            }

        if method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            puzzle_id = body.get('id')
            if not puzzle_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id is required'})
                }

            title = body.get('title', '').strip()
            study_years = body.get('study_years') or []
            words = body.get('words') or []
            hints = body.get('hints') or []
            is_active = body.get('is_active', True)
            sort_order = body.get('sort_order', 0)
            olympiad_type = body.get('olympiad_type', 'palette')

            words_clean = [w.strip().upper() for w in words if w.strip()]
            hints_aligned = hints[:len(words_clean)] + [''] * max(0, len(words_clean) - len(hints))

            cursor.execute("""
                UPDATE word_search_puzzles
                SET title = %s, study_years = %s, words = %s, hints = %s, is_active = %s,
                    sort_order = %s, olympiad_type = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (title, study_years if study_years else None, json.dumps(words_clean), json.dumps(hints_aligned), is_active, sort_order, olympiad_type, puzzle_id))

            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }

        if method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            puzzle_id = body.get('id')
            if not puzzle_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id is required'})
                }

            cursor.execute("DELETE FROM word_search_puzzles WHERE id = %s", (puzzle_id,))
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }

    except Exception as e:
        cursor.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
