import firebase_admin
from firebase_admin import credentials, firestore
from google import genai
import requests
import json
import os
import re
from datetime import datetime

# --- CONFIGURATION ---
# This setup allows the script to work on your PC AND on GitHub Actions
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAPfY7K4_buqxETMRLzfxSfVytWmsBJn4A")
NEWS_API_KEY = os.environ.get("NEWS_API_KEY", "eab5cc4208d6421590df01d0d096547e")

# Path logic: Find service-account.json in the same folder as this script
script_dir = os.path.dirname(os.path.abspath(__file__))
FIREBASE_KEY_PATH = os.path.join(script_dir, "service-account.json")

# 1. Setup Clients
try:
    if not firebase_admin._apps:
        # Ensure the file exists before trying to load it
        if not os.path.exists(FIREBASE_KEY_PATH):
            raise FileNotFoundError(f"Missing {FIREBASE_KEY_PATH}. Make sure it's in the scripts folder.")
            
        cred = credentials.Certificate(FIREBASE_KEY_PATH)
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    client = genai.Client(api_key=GEMINI_API_KEY)
except Exception as e:
    print(f"❌ Setup Error: {e}")
    exit()

def update_climate_news():
    print("🌍 Fetching latest climate news...")
    
    # 2. Get Raw Articles (NewsAPI)
    # Broadened search query to ensure we get results even on slow news days
    url = f"https://newsapi.org/v2/everything?q=%22climate+change%22+OR+environment+OR+sustainability&sortBy=publishedAt&language=en&pageSize=15&apiKey={NEWS_API_KEY}"
    
    try:
        response = requests.get(url).json()
        articles = response.get('articles', [])
        print(f"📊 Found {len(articles)} articles from NewsAPI.")
    except Exception as e:
        print(f"❌ NewsAPI Error: {e}")
        return

    if not articles:
        print("❌ No articles found. Check your API key or internet connection.")
        return

    # Prepare data for Gemma
    headlines = []
    for i, a in enumerate(articles):
        # Limit title length for the prompt
        clean_title = a['title'][:80]
        headlines.append(f"ID:{i} | Title: {clean_title} | Source: {a['source']['name']}")

    prompt_text = "\n".join(headlines)

    # 3. AI Curation
    print("🧠 Asking Gemma to curate list...")
    
    prompt = f"""You are a Climate News Editor.
TASK: From the list below, pick the 8 most relevant climate science or environmental policy articles.
RULES: Return ONLY a JSON list of IDs. No intro text, no conversational filler.

EXAMPLE OUTPUT:
[0, 2, 3, 5, 8, 10, 12, 14]

ACTUAL LIST:
{prompt_text}

JSON LIST OF 8 IDs:"""

    try:
        ai_response = client.models.generate_content(
            model="gemma-3-27b-it",
            contents=prompt
        )
        
        raw_text = ai_response.text
        if not raw_text:
            print("⚠️ AI returned empty text. Using fallback.")
            selected_ids = list(range(min(8, len(articles))))
        else:
            # Use Regex to extract the JSON list [...] from Gemma's response
            match = re.search(r'\[[\d\s,]*\]', raw_text)
            if match:
                selected_ids = json.loads(match.group(0))
            else:
                print(f"⚠️ AI gave bad format. Falling back to first 8. Raw: {raw_text[:50]}...")
                selected_ids = list(range(min(8, len(articles))))

        print(f"✅ Successfully selected {len(selected_ids)} articles.")

    except Exception as e:
        print(f"❌ AI Error: {e}. Falling back to default list.")
        selected_ids = list(range(min(8, len(articles))))

    # 4. Upload to Firestore
    print("🔥 Uploading to App...")
    try:
        batch = db.batch()
        
        # Clear old news to keep the app fresh
        old_docs = db.collection('ClimateNews').stream()
        for doc in old_docs:
            batch.delete(doc.reference)
        
        # Add new news
        count = 0
        for index in selected_ids:
            try:
                idx = int(index)
                if idx >= len(articles): continue
                
                article = articles[idx]
                # Create a clean, unique ID for Firestore
                doc_id = "".join(x for x in article['title'] if x.isalnum())[:30]
                
                doc_ref = db.collection('ClimateNews').document(doc_id)
                batch.set(doc_ref, {
                    "title": article['title'],
                    "url": article['url'],
                    "source": article['source']['name'],
                    "date": datetime.now().isoformat(),
                    "description": article.get('description', 'Read more on the source website.')
                })
                count += 1
            except:
                continue

        batch.commit()
        print(f"✅ Success! App updated with {count} new stories.")
        
    except Exception as e:
        print(f"❌ Firestore Upload Error: {e}")

if __name__ == "__main__":
    update_climate_news()