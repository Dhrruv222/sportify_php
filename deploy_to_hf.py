#!/usr/bin/env python3
"""
Hugging Face Space Deployment Script for Sportify AI
Follow the prompts to authenticate and create your Space
"""

from huggingface_hub import HfApi, login
import os
import sys
from pathlib import Path

def main():
    print("\n" + "="*60)
    print("🚀 Sportify AI - Hugging Face Space Deployment")
    print("="*60)
    
    # Step 1: Get API token
    print("\n📝 Step 1: Hugging Face Authentication")
    print("-" * 60)
    print("You need a Hugging Face API token with 'write' access.")
    print("\n1. Go to: https://huggingface.co/settings/tokens")
    print("2. Click 'New token'")
    print("3. Name: 'sportify-deployment'")
    print("4. Role: 'write'")
    print("5. Copy the token\n")
    
    token = input("Paste your Hugging Face token: ").strip()
    
    if not token:
        print("❌ Error: Token is required")
        sys.exit(1)
    
    # Save token
    login(token=token)
    print("✅ Token saved!")
    
    # Step 2: Verify authentication
    print("\n✓ Step 2: Verifying Authentication")
    print("-" * 60)
    
    try:
        api = HfApi(token=token)
        user_info = api.whoami()
        print(f"✅ Authenticated as: {user_info['name']}")
        username = user_info['name']
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        sys.exit(1)
    
    # Step 3: Create Space
    print("\n🔧 Step 3: Create Space Repository")
    print("-" * 60)
    
    space_name = "sportify-ai-testing"
    print(f"Creating Space: '{space_name}'...")
    print(f"This will be available at: https://huggingface.co/spaces/{username}/{space_name}")
    
    try:
        repo_url = api.create_repo(
            repo_id=space_name,
            repo_type="space",
            space_sdk="streamlit",
            private=False,
            exist_ok=True
        )
        print(f"✅ Space created: {repo_url}")
    except Exception as e:
        print(f"⚠️  Space creation note: {e}")
        repo_url = f"https://huggingface.co/spaces/{username}/{space_name}"
    
    # Step 4: Clone repository
    print("\n📥 Step 4: Clone Space Repository")
    print("-" * 60)
    
    clone_dir = Path.home() / "hf-spaces-sportify"
    
    if clone_dir.exists():
        print(f"Directory already exists: {clone_dir}")
        use_existing = input("Use existing directory? (y/n): ").strip().lower()
        if use_existing != 'y':
            import shutil
            shutil.rmtree(clone_dir)
            print(f"Removed {clone_dir}")
    
    os.system(f'git clone {repo_url} "{clone_dir}"')
    print(f"✅ Cloned to: {clone_dir}")
    
    # Step 5: Copy files
    print("\n📋 Step 5: Copy Sportify AI Files")
    print("-" * 60)
    
    source_dir = Path("C:/Users/vishn/Desktop/Sportify AI/hf-space")
    target_dir = clone_dir
    
    files_to_copy = [
        "app.py",
        "requirements.txt",
        "README.md"
    ]
    
    for file in files_to_copy:
        src = source_dir / file
        dst = target_dir / file
        if src.exists():
            import shutil
            shutil.copy(src, dst)
            print(f"✅ Copied {file}")
        else:
            print(f"⚠️  {file} not found")
    
    # Step 6: Push to Hugging Face
    print("\n🚀 Step 6: Deploy to Hugging Face Spaces")
    print("-" * 60)
    
    os.chdir(clone_dir)
    os.system("git config user.name 'Sportify Deployer'")
    os.system("git config user.email 'deploy@sportify.ai'")
    os.system("git add .")
    os.system('git commit -m "Deploy Sportify AI testing interface"')
    os.system("git push")
    
    # Step 7: Done!
    print("\n" + "="*60)
    print("✅ DEPLOYMENT COMPLETE!")
    print("="*60)
    print(f"\n🎉 Your Space is live at:")
    print(f"   https://huggingface.co/spaces/{username}/{space_name}")
    print(f"\n🔧 Configuration:")
    print(f"   - API URL: http://localhost:3000/api (configurable in app sidebar)")
    print(f"   - Testing: Use sidebar to test connection")
    print(f"\n📚 Next steps:")
    print(f"   1. Visit your Space URL above")
    print(f"   2. Configure API URL in the sidebar")
    print(f"   3. Click 'Test Connection' to verify")
    print(f"   4. Start testing the interface!")
    print(f"\n💡 To update the Space in future:")
    print(f"   cd {clone_dir}")
    print(f"   git add .")
    print(f"   git commit -m 'Update'")
    print(f"   git push")
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()
