"""Explicit input revisions shared by the offline data preparation tools."""
import json
from pathlib import Path
import re
from datetime import date
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]


def load(root=ROOT):
    value = json.loads((root / 'data/pipeline.json').read_text(encoding='utf-8'))
    if value.get('schemaVersion') != 1 or not re.fullmatch(r'scryfall-all-cards-\d{14}', value['cardSnapshot']):
        raise ValueError('Invalid card pipeline revision')
    event = value['event']
    if (not re.fullmatch(r'[a-z][a-z0-9-]+', event['id']) or
            not re.fullmatch(r'magiccon-' + re.escape(event['id']) + r'-\d{8}T\d{6}Z', event['snapshot']) or
            not re.fullmatch(r'\d+', event['sourceId'])):
        raise ValueError('Invalid event pipeline identity')
    site = urlsplit(event['site'])
    if (site.scheme != 'https' or not re.fullmatch(r'[a-z0-9-]+\.mtgfestivals\.com', site.hostname or '')
            or site.username or site.password or site.port or site.path):
        raise ValueError('Event site must be an official HTTPS mtgfestivals subdomain')
    for field in ['overview', 'directory']:
        url = urlsplit(event[field])
        if url.scheme != 'https' or url.netloc != site.netloc or url.username or url.password:
            raise ValueError('Event source outside its configured official host')
    if date.fromisoformat(event['dates']['start']) > date.fromisoformat(event['dates']['end']):
        raise ValueError('Event ends before it starts')
    return value


SETTINGS = load()
EVENT = SETTINGS['event']
CARD_MANIFEST = ROOT / f"data/manifests/{SETTINGS['cardSnapshot']}.json"
EVENT_MANIFEST = ROOT / f"data/manifests/{EVENT['snapshot']}.json"
EVENT_PATH = ROOT / f"data/curated/events/{EVENT['id']}.json"
