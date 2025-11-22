#!/usr/bin/env python3
"""
Merge Lessons Script

This script merges all lesson files into a single complete file.

Usage:
    python merge_lessons.py
"""

import json
import sys
import os

def merge_lessons():
    """Merge all lesson files into a single complete file."""
    
    print("="*80)
    print("MERGING ALL LESSON FILES")
    print("="*80)
    
    # Define all lesson files to merge in order
    lesson_files = [
        ('lessons_1_to_70_bilingual_complete_ENHANCED.json', '1-70'),
        ('lessons_71_to_80_bilingual.json', '71-80'),
        ('lessons_81_to_90_bilingual.json', '81-90'),
        ('lessons_91_to_100_bilingual.json', '91-100'),
        ('lessons_101_to_106_bilingual.json', '101-106'),
    ]
    
    merged_data = None
    total_lessons_loaded = 0
    
    # Load and merge each file
    for filename, range_desc in lesson_files:
        print(f"\nLoading lessons {range_desc} from {filename}...")
        
        if not os.path.exists(filename):
            print(f"⚠ Warning: {filename} not found, skipping...")
            continue
        
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            lessons_count = len(data['lessons'])
            print(f"✓ Loaded {lessons_count} lessons from {range_desc}")
            
            if merged_data is None:
                # First file - use as base
                merged_data = data
                total_lessons_loaded = lessons_count
            else:
                # Subsequent files - append lessons
                merged_data['lessons'].extend(data['lessons'])
                total_lessons_loaded += lessons_count
                
        except Exception as e:
            print(f"✗ Error loading {filename}: {e}")
            continue
    
    if merged_data is None:
        print("\nERROR: No lesson files could be loaded!")
        sys.exit(1)
    
    # Update metadata
    if 'metadata' in merged_data:
        merged_data['metadata']['total_lessons'] = total_lessons_loaded
        merged_data['metadata']['description'] = f"A1 English-Serbian Learning Course - Lessons 1-{total_lessons_loaded}"
    
    # Calculate statistics
    total_sentences = sum(len(lesson.get('sentences', [])) for lesson in merged_data['lessons'])
    total_words = sum(len(lesson.get('words', [])) for lesson in merged_data['lessons'])
    
    print(f"\n✓ Merged successfully!")
    print(f"\nStatistics:")
    print(f"  - Total lessons: {total_lessons_loaded}")
    print(f"  - Total vocabulary words: {total_words}")
    print(f"  - Total sentences: {total_sentences}")
    if total_words > 0:
        print(f"  - Average sentences per word: {total_sentences/total_words:.1f}")
    
    # Save the merged file
    output_file = f'lessons_1_to_{total_lessons_loaded}_bilingual_complete.json'
    print(f"\nSaving to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Saved successfully!")
    print("\n" + "="*80)
    print("MERGE COMPLETE!")
    print("="*80)
    print(f"\nOutput file: {output_file}")
    print(f"File contains all {total_lessons_loaded} lessons with {total_sentences} sentences.")

if __name__ == "__main__":
    merge_lessons()
