import uvicorn
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

if __name__ == '__main__':
    print('=' * 65)
    print('  STANDMAP — Standards Mapping & Applicability Platform')
    print('  AI-Powered Recommendation Engine for Indian Standards (SIH26108)')
    print('  Department of Consumer Affairs • Smart Automation')
    print('=' * 65)
    print('  [+] Swagger API Documentation : http://127.0.0.1:8000/docs')
    print('  [+] STANDMAP Web Application  : http://127.0.0.1:8000')
    print('=' * 65)
    uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=False)
