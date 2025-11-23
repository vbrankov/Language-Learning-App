#!/usr/bin/env python3
"""
Apply JSON Patch corrections to the A1 course database.

This script reads corrections from a JSON Patch file and applies them
to the main course database.

Usage:
    python apply_corrections.py corrections.json a1_english_serbian_complete_106_lessons.json

Output:
    Creates: a1_english_serbian_complete_106_lessons_corrected.json
"""

import json
import sys
from typing import Any, List, Dict

def parse_path(path: str) -> List[str]:
    """Parse JSON Pointer path into list of keys/indices."""
    if not path.startswith('/'):
        raise ValueError(f"Invalid path: {path}")
    
    # Remove leading slash and split
    parts = path[1:].split('/')
    
    # Unescape special characters
    result = []
    for part in parts:
        # JSON Pointer escaping: ~0 -> ~, ~1 -> /
        part = part.replace('~1', '/').replace('~0', '~')
        result.append(part)
    
    return result

def get_value(obj: Any, path_parts: List[str]) -> Any:
    """Get value at path in object."""
    current = obj
    for part in path_parts:
        if isinstance(current, list):
            idx = int(part) if part != '-' else len(current)
            current = current[idx]
        elif isinstance(current, dict):
            current = current[part]
        else:
            raise ValueError(f"Cannot navigate through {type(current)}")
    return current

def set_value(obj: Any, path_parts: List[str], value: Any) -> None:
    """Set value at path in object."""
    if not path_parts:
        raise ValueError("Empty path")
    
    current = obj
    for part in path_parts[:-1]:
        if isinstance(current, list):
            idx = int(part)
            current = current[idx]
        elif isinstance(current, dict):
            current = current[part]
        else:
            raise ValueError(f"Cannot navigate through {type(current)}")
    
    last_part = path_parts[-1]
    if isinstance(current, list):
        idx = int(last_part) if last_part != '-' else len(current)
        if last_part == '-':
            current.append(value)
        else:
            current[idx] = value
    elif isinstance(current, dict):
        current[last_part] = value
    else:
        raise ValueError(f"Cannot set value in {type(current)}")

def delete_value(obj: Any, path_parts: List[str]) -> None:
    """Delete value at path in object."""
    if not path_parts:
        raise ValueError("Empty path")
    
    current = obj
    for part in path_parts[:-1]:
        if isinstance(current, list):
            idx = int(part)
            current = current[idx]
        elif isinstance(current, dict):
            current = current[part]
        else:
            raise ValueError(f"Cannot navigate through {type(current)}")
    
    last_part = path_parts[-1]
    if isinstance(current, list):
        idx = int(last_part)
        del current[idx]
    elif isinstance(current, dict):
        del current[last_part]
    else:
        raise ValueError(f"Cannot delete from {type(current)}")

def apply_patch(data: Dict, patches: List[Dict]) -> Dict:
    """Apply JSON Patch operations to data."""
    
    for i, patch in enumerate(patches):
        op = patch.get('op')
        path = patch.get('path')
        comment = patch.get('comment', '')
        
        if comment:
            print(f"\nPatch {i+1}: {comment}")
        else:
            print(f"\nPatch {i+1}: {op} {path}")
        
        try:
            path_parts = parse_path(path)
            
            if op == 'add':
                value = patch['value']
                set_value(data, path_parts, value)
                print(f"  ✓ Added to {path}")
                
            elif op == 'remove':
                delete_value(data, path_parts)
                print(f"  ✓ Removed {path}")
                
            elif op == 'replace':
                value = patch['value']
                set_value(data, path_parts, value)
                print(f"  ✓ Replaced {path}")
                
            elif op == 'test':
                value = patch['value']
                current = get_value(data, path_parts)
                if current != value:
                    raise ValueError(f"Test failed: expected {value}, got {current}")
                print(f"  ✓ Test passed")
                
            elif op == 'copy':
                from_path = patch['from']
                from_parts = parse_path(from_path)
                value = get_value(data, from_parts)
                set_value(data, path_parts, value)
                print(f"  ✓ Copied from {from_path} to {path}")
                
            elif op == 'move':
                from_path = patch['from']
                from_parts = parse_path(from_path)
                value = get_value(data, from_parts)
                delete_value(data, from_parts)
                set_value(data, path_parts, value)
                print(f"  ✓ Moved from {from_path} to {path}")
                
            else:
                print(f"  ✗ Unknown operation: {op}")
                
        except Exception as e:
            print(f"  ✗ Error: {e}")
            print(f"     Patch: {patch}")
            response = input("    Continue with remaining patches? (y/n): ")
            if response.lower() != 'y':
                raise
    
    return data

def main():
    if len(sys.argv) != 3:
        print("Usage: python apply_corrections.py corrections.json database.json")
        sys.exit(1)
    
    corrections_file = sys.argv[1]
    database_file = sys.argv[2]
    
    print("="*80)
    print("APPLYING JSON PATCH CORRECTIONS")
    print("="*80)
    
    # Load corrections
    print(f"\nLoading corrections from: {corrections_file}")
    with open(corrections_file, 'r', encoding='utf-8') as f:
        corrections = json.load(f)
    print(f"  ✓ Loaded {len(corrections)} corrections")
    
    # Load database
    print(f"\nLoading database from: {database_file}")
    with open(database_file, 'r', encoding='utf-8') as f:
        database = json.load(f)
    print(f"  ✓ Loaded {len(database.get('lessons', []))} lessons")
    
    # Apply patches
    print("\n" + "="*80)
    print("APPLYING PATCHES")
    print("="*80)
    
    database = apply_patch(database, corrections)
    
    # Save corrected database
    output_file = database_file.replace('.json', '_corrected.json')
    print("\n" + "="*80)
    print(f"Saving corrected database to: {output_file}")
    print("="*80)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(database, f, ensure_ascii=False, indent=2)
    
    print(f"  ✓ Saved successfully!")
    print("\n" + "="*80)
    print("CORRECTIONS APPLIED SUCCESSFULLY")
    print("="*80)

if __name__ == '__main__':
    main()
