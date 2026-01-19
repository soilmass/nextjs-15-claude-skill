#!/usr/bin/env python3
"""
Skillbase Validation Script

Validates all skill markdown files against schema and layer composition rules.

Usage:
    python validate.py              # Full validation
    python validate.py --stats      # Show statistics only
    python validate.py --refs       # Check reference integrity
    python validate.py --ci         # CI mode (exit code 1 on errors)
"""

import os
import re
import sys
import glob
import argparse
from typing import Dict, List, Set, Tuple, Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REFS_DIR = os.path.join(BASE_DIR, "references")

# Layer configuration
LAYERS = {
    'primitives': {'level': 0, 'prefix': 'p-', 'can_compose': []},
    'atoms': {'level': 1, 'prefix': 'a-', 'can_compose': ['primitives']},
    'molecules': {'level': 2, 'prefix': 'm-', 'can_compose': ['primitives', 'atoms']},
    'organisms': {'level': 3, 'prefix': 'o-', 'can_compose': ['primitives', 'atoms', 'molecules']},
    'templates': {'level': 4, 'prefix': 't-', 'can_compose': ['primitives', 'atoms', 'molecules', 'organisms']},
    'patterns': {'level': 5, 'prefix': 'pt-', 'can_compose': ['primitives', 'atoms', 'molecules', 'organisms', 'templates']},
    'recipes': {'level': 6, 'prefix': 'r-', 'can_compose': ['primitives', 'atoms', 'molecules', 'organisms', 'templates', 'patterns']},
}

REQUIRED_FIELDS = ['id', 'name', 'version', 'layer', 'category', 'description', 'tags']


def parse_frontmatter(filepath: str) -> Tuple[Dict, List[str]]:
    """Extract frontmatter from a markdown file."""
    errors = []
    frontmatter = {}

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {}, [f"Cannot read file: {e}"]

    # Check for frontmatter delimiters
    if not content.startswith('---'):
        return {}, ["Missing frontmatter (file must start with ---)"]

    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return {}, ["Invalid frontmatter format"]

    fm_content = match.group(1)

    # Parse YAML-like frontmatter manually (simple parser)
    current_key = None
    current_list = None

    for line in fm_content.split('\n'):
        stripped = line.strip()

        # Skip empty lines and comments
        if not stripped or stripped.startswith('#'):
            continue

        # Check for key: value
        if ':' in line and not line.startswith(' ') and not line.startswith('\t'):
            parts = line.split(':', 1)
            key = parts[0].strip()
            value = parts[1].strip() if len(parts) > 1 else ''

            # Handle inline arrays [a, b, c]
            if value.startswith('[') and value.endswith(']'):
                items = value[1:-1].split(',')
                frontmatter[key] = [i.strip().strip('"\'') for i in items if i.strip()]
            elif value:
                # Remove quotes
                value = value.strip('"\'')
                frontmatter[key] = value
            else:
                frontmatter[key] = []
                current_list = key
            current_key = key

        # Handle list items
        elif stripped.startswith('- '):
            item = stripped[2:].strip().strip('"\'')
            if current_list and current_list in frontmatter:
                frontmatter[current_list].append(item)

        # Handle nested key-value (simple)
        elif ':' in stripped and current_key:
            parts = stripped.split(':', 1)
            nested_key = parts[0].strip()
            nested_value = parts[1].strip().strip('"\'') if len(parts) > 1 else ''
            if isinstance(frontmatter.get(current_key), dict):
                frontmatter[current_key][nested_key] = nested_value
            elif frontmatter.get(current_key) == [] or frontmatter.get(current_key) is None:
                frontmatter[current_key] = {nested_key: nested_value}

    return frontmatter, errors


def validate_frontmatter(frontmatter: Dict, filepath: str, layer_name: str) -> List[str]:
    """Validate frontmatter fields."""
    errors = []
    filename = os.path.basename(filepath)

    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in frontmatter:
            errors.append(f"Missing required field: {field}")

    # Validate ID prefix
    if 'id' in frontmatter:
        expected_prefix = LAYERS[layer_name]['prefix']
        if not frontmatter['id'].startswith(expected_prefix):
            errors.append(f"ID '{frontmatter['id']}' should start with '{expected_prefix}'")

    # Validate layer field
    if 'layer' in frontmatter:
        expected_layer = f"L{LAYERS[layer_name]['level']}"
        if frontmatter['layer'] != expected_layer:
            errors.append(f"Layer should be '{expected_layer}', got '{frontmatter['layer']}'")

    return errors


def validate_composes(frontmatter: Dict, filepath: str, layer_name: str) -> List[str]:
    """Validate composition references."""
    errors = []
    current_dir = os.path.dirname(filepath)
    allowed_layers = LAYERS[layer_name]['can_compose']

    composes = frontmatter.get('composes', [])
    if not composes or composes == []:
        return []

    for ref in composes:
        if not isinstance(ref, str):
            continue

        # Check if reference file exists
        if ref.startswith('../'):
            ref_path = os.path.normpath(os.path.join(current_dir, ref))
            if not os.path.exists(ref_path):
                errors.append(f"Broken reference: {ref}")
            else:
                # Check layer compliance
                ref_layer = ref.split('/')[1] if '/' in ref else None
                if ref_layer and ref_layer not in allowed_layers:
                    errors.append(f"Invalid composition: {layer_name} cannot compose from {ref_layer}")

    return errors


def get_all_skills() -> Dict[str, List[str]]:
    """Get all skill files organized by layer."""
    skills = {}
    for layer_name in LAYERS:
        dir_path = os.path.join(REFS_DIR, layer_name)
        if os.path.exists(dir_path):
            files = glob.glob(os.path.join(dir_path, '*.md'))
            skills[layer_name] = [f for f in files if not os.path.basename(f).startswith(('_', 'README'))]
    return skills


def validate_all() -> Tuple[int, int, Dict[str, List[str]]]:
    """Validate all skill files."""
    total_files = 0
    total_errors = 0
    all_errors = {}

    skills = get_all_skills()

    for layer_name, files in skills.items():
        for filepath in sorted(files):
            total_files += 1
            filename = os.path.basename(filepath)
            errors = []

            # Parse frontmatter
            frontmatter, parse_errors = parse_frontmatter(filepath)
            errors.extend(parse_errors)

            if frontmatter:
                # Validate frontmatter
                errors.extend(validate_frontmatter(frontmatter, filepath, layer_name))

                # Validate compositions
                errors.extend(validate_composes(frontmatter, filepath, layer_name))

            if errors:
                all_errors[filepath] = errors
                total_errors += len(errors)

    return total_files, total_errors, all_errors


def check_reference_integrity() -> Tuple[int, List[str]]:
    """Check that all references point to existing files."""
    broken_refs = []
    skills = get_all_skills()

    for layer_name, files in skills.items():
        for filepath in files:
            frontmatter, _ = parse_frontmatter(filepath)
            composes = frontmatter.get('composes', [])

            if not composes or composes == []:
                continue

            current_dir = os.path.dirname(filepath)
            for ref in composes:
                if isinstance(ref, str) and ref.startswith('../'):
                    ref_path = os.path.normpath(os.path.join(current_dir, ref))
                    if not os.path.exists(ref_path):
                        broken_refs.append(f"{os.path.basename(filepath)}: {ref}")

    return len(broken_refs), broken_refs


def print_stats():
    """Print skillbase statistics."""
    skills = get_all_skills()

    print("=" * 60)
    print("SKILLBASE STATISTICS")
    print("=" * 60)

    total = 0
    for layer_name in ['primitives', 'atoms', 'molecules', 'organisms', 'templates', 'patterns', 'recipes']:
        count = len(skills.get(layer_name, []))
        level = LAYERS[layer_name]['level']
        prefix = LAYERS[layer_name]['prefix']
        print(f"L{level} {layer_name:12} ({prefix:3}): {count:4} files")
        total += count

    print("-" * 60)
    print(f"{'TOTAL':19}: {total:4} files")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(description='Validate skillbase')
    parser.add_argument('--stats', action='store_true', help='Show statistics only')
    parser.add_argument('--refs', action='store_true', help='Check reference integrity')
    parser.add_argument('--ci', action='store_true', help='CI mode (exit 1 on errors)')
    args = parser.parse_args()

    if args.stats:
        print_stats()
        return 0

    if args.refs:
        count, broken = check_reference_integrity()
        if count > 0:
            print(f"Found {count} broken references:")
            for ref in broken[:20]:
                print(f"  - {ref}")
            if count > 20:
                print(f"  ... and {count - 20} more")
            return 1 if args.ci else 0
        else:
            print("All references are valid")
            return 0

    # Full validation
    print("=" * 60)
    print("SKILLBASE VALIDATION REPORT")
    print("=" * 60)

    total_files, total_errors, all_errors = validate_all()

    # Print layer summary
    skills = get_all_skills()
    print(f"\nFiles validated: {total_files}")
    print("\nLayer Status:")
    print("-" * 40)

    for layer_name in ['primitives', 'atoms', 'molecules', 'organisms', 'templates', 'patterns', 'recipes']:
        count = len(skills.get(layer_name, []))
        level = LAYERS[layer_name]['level']
        prefix = LAYERS[layer_name]['prefix']
        layer_errors = sum(1 for f, e in all_errors.items() if f'/{layer_name}/' in f)
        status = "OK" if layer_errors == 0 else f"{layer_errors} errors"
        print(f"L{level} {layer_name:12} ({prefix:3}): {count:4} files  {status}")

    # Print errors if any
    if total_errors > 0:
        print(f"\n{'=' * 60}")
        print(f"ERRORS FOUND: {total_errors}")
        print("=" * 60)

        for filepath, errors in list(all_errors.items())[:10]:
            print(f"\n{os.path.basename(filepath)}:")
            for error in errors:
                print(f"  - {error}")

        if len(all_errors) > 10:
            print(f"\n... and {len(all_errors) - 10} more files with errors")

        return 1 if args.ci else 0
    else:
        print(f"\n{'=' * 60}")
        print("VALIDATION PASSED")
        print("=" * 60)
        print("All files are valid")
        return 0


if __name__ == '__main__':
    sys.exit(main())
